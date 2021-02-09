import IframeResizer, { IFrameComponent } from 'iframe-resizer-react';
import _ from 'lodash';
import React, { useCallback } from 'react';
import { Spinner } from 'react-bootstrap';
import logger from '../Utilities/Logger';
import { xRayVision } from '../Utilities/NakedPromise';

interface RendererIFrameProps {
    renderedHTML: string;
    useReadonlyHeight?: boolean;
    loading: boolean;
    onLoad: (renderedHTML: string) => void;
    shouldStopLoading: () => boolean;
    submitHandler: (problemForm: HTMLFormElement, clickedButton?: HTMLButtonElement) => void;
    changeHandler: (initialLoad: boolean, problemForm: HTMLFormElement, submitButtons: NodeListOf<HTMLButtonElement>) => void;
}

export const RendererIFrame: React.FC<RendererIFrameProps> = ({
    renderedHTML,
    useReadonlyHeight = false,
    loading,
    onLoad,
    shouldStopLoading,
    submitHandler,
    changeHandler
}) => {
    const insertListeners = useCallback((iframe: IFrameComponent, problemForm: HTMLFormElement) => {
        const iframeWindow = iframe.contentWindow as any | null | undefined;
        iframeWindow.rederlyInsertedListeners = iframeWindow.rederlyInsertedListeners ?? 0;
        iframeWindow.rederlyInsertedListeners++;
        if (iframeWindow.rederlyInsertedListeners > 1) {
            logger.warn(`ProblemIframe: insertListeners: has attempted to insert listeners ${iframeWindow.rederlyInsertedListeners} times ... skipping!`);
            return;
        }
        logger.debug('ProblemIframe: insertListeners: is inserting listeners');

        // submission of problems will trigger updateSubmitActive @onLoad
        // because re-submission of identical answers is blocked, we expect srcdoc to change
        problemForm.addEventListener('submit', (event: { preventDefault: () => void; }) => {
            event.preventDefault();
            const clickedButton = problemForm.querySelector('.btn-clicked') as HTMLButtonElement;
            submitHandler(problemForm, clickedButton);
        });

        const submitButtons: NodeListOf<HTMLButtonElement> = iframe.contentWindow?.document.getElementsByName('submitAnswers') as NodeListOf<HTMLButtonElement>;
        const noParamChangeHandler = () => changeHandler(false, problemForm, submitButtons);
        problemForm.addEventListener('input', noParamChangeHandler);
    }, [changeHandler, submitHandler]);

    const onLoadHandlers = useCallback(async (iframe: IFrameComponent) => {
        const submitButtons: NodeListOf<HTMLButtonElement> = iframe.contentWindow?.document.getElementsByName('submitAnswers') as NodeListOf<HTMLButtonElement>;

        logger.debug('onLoadHandlers called');
        if (shouldStopLoading()) {
            return;
        }

        const iframeHTML = iframe.attributes?.getNamedItem('srcdoc')?.nodeValue;
        if (renderedHTML === '' || renderedHTML !== iframeHTML) {
            logger.debug('onLoadHandlers bowing out since renderedHTML is empty string or does not match the current request');
            return;
        }

        logger.debug('onLoadHandlers running');

        const iframeDoc = iframe.contentDocument;
        const iframeWindow = iframe.contentWindow as any | null | undefined;

        if (!iframeDoc) return; // this will prevent empty renderedHTML

        const body = iframeDoc?.body;
        if (body === undefined) {
            logger.error('Couldn\'t access body of iframe');
            return;
        }

        const problemForm = iframeWindow?.document.getElementById('problemMainForm') as HTMLFormElement;
        if (!_.isNil(problemForm)) {
            insertListeners(iframe, problemForm);
            changeHandler(true, problemForm, submitButtons);
        } else {
            if (renderedHTML !== '') {
                logger.error(`This problem has no problemMainForm: ${renderedHTML}`); // should NEVER happen when renderedHTML is non-empty
            }
        }

        const ww_applet_list = iframeWindow?.ww_applet_list;
        let loadingPromise: Promise<unknown> = Promise.resolve();
        if (!_.isNil(ww_applet_list)) {
            const promises = Object.keys(ww_applet_list).map( async (key: string) => {
                const initFunctionName = ww_applet_list[key].onInit;
                // stash original ggbOnInit, then spy on it with a Promise
                const onInitOriginal = iframeWindow?.[initFunctionName];
                const { dressedFunction: dressedInit, nakedPromise } = xRayVision(onInitOriginal);
                iframeWindow[initFunctionName] = dressedInit;

                // getApplet(key) will not resolve until after ggbOnInit runs
                await nakedPromise.promise;

                const {getApplet} = iframeWindow;
                getApplet(key).registerUpdateListener?.(_.throttle(()=>{
                    ww_applet_list[key].submitAction();
                    problemForm.dispatchEvent(new Event('input'));
                }, 100, {leading:true, trailing:true}));
            });
            loadingPromise = Promise.all(promises);
        }

        loadingPromise.then(() => {
            if (renderedHTML === iframeHTML) {
                iframeDoc?.dispatchEvent(new Event('Rederly Loaded'));
                onLoad(iframeHTML);
            }
        });
    }, [changeHandler, insertListeners, onLoad, renderedHTML, shouldStopLoading]);

    return <>
        { loading && <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>}
        {!_.isEmpty(renderedHTML) && <IframeResizer
            // Using onInit instead of ref because:
            // ref never get's set and a warning saying to use `forwardRef` comes up in the console
            // Using forwardRef does not give you access to the iframe, rather it gives you access to 3 or 4 methods and properties (like `sendMessage`)
            onInit={(iframe: IFrameComponent) => {
                onLoadHandlers(iframe);
            }}
            title='Problem Frame'
            style={{
                width: '100%',
                height: '100vh',
                border: 'none',
                minHeight: useReadonlyHeight ? '' : '350px',
                // visibility: (loading || Boolean(alert.message)) ? 'hidden' : 'visible'
                visibility: (loading) ? 'hidden' : 'visible'
            }}
            sandbox='allow-same-origin allow-forms allow-scripts allow-popups'
            srcDoc={renderedHTML}
            // Empty string check unmounts this each time so we don't need it anymore
            // onLoad={onLoadHandlers}
            checkOrigin={false}
            scrolling={false}
        />}
    </>;
};
