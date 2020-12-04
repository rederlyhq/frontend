import React, { useRef, useEffect, useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import _ from 'lodash';
import { Alert, Spinner } from 'react-bootstrap';
import { postQuestionSubmission, putQuestionGrade, putQuestionGradeInstance, postPreviewQuestion, getQuestion } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import moment from 'moment';
import { useCurrentProblemState } from '../Contexts/CurrentProblemState';
import { xRayVision } from '../Utilities/NakedPromise';
import IframeResizer, { IFrameComponent } from 'iframe-resizer-react';
import logger from '../Utilities/Logger';
import BackendAPIError from '../APIInterfaces/BackendAPI/BackendAPIError';
import useAlertState from '../Hooks/useAlertState';

interface ProblemIframeProps {
    problem: ProblemObject;
    setProblemStudentGrade?: (val: any) => void;
    previewPath?: string;
    previewSeed?: number;
    previewProblemSource?: string;
    previewShowHints?: boolean;
    previewShowSolutions?: boolean;
    workbookId?: number;
    readonly?: boolean;
    userId?: number;
    studentTopicAssessmentInfoId?: number;
    propagateLoading?: (loading: boolean)=>void;
}

interface PendingRequest {
    cancelled?: boolean;
    problemId?: number;
    workbookId?: number;
}

/**
 * The most important part- rendering the problem.
 * We used the document.write strategy before for backwards compatibility, but modern browsers now block it.
 * We _could_ also set the form to just render the URL directly from the server, but this provides more flexibility
 * with further work on the JSON data.
 * Important reference: https://medium.com/the-thinkmill/how-to-safely-inject-html-in-react-using-an-iframe-adc775d458bc
 */
export const ProblemIframe: React.FC<ProblemIframeProps> = ({
    problem,
    previewPath,
    previewSeed,
    previewProblemSource,
    previewShowHints,
    previewShowSolutions,
    setProblemStudentGrade = ()=>{},
    workbookId,
    readonly = false,
    userId,
    studentTopicAssessmentInfoId,
    propagateLoading,
}) => {
    const iframeRef = useRef<IFrameComponent>(null);
    const pendingReq = useRef<PendingRequest | null>(null);
    const [renderedHTML, setRenderedHTML] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useAlertState();
    const [lastSubmission, setLastSubmission] = useState({});
    const height = '100vh';
    const currentMutationObserver = useRef<MutationObserver> (null);

    const { setLastSavedAt, setLastSubmittedAt } = useCurrentProblemState();

    // Propagates loading states to parent listeners.
    useEffect(()=>{
        propagateLoading?.(loading);
    }, [loading]);

    useEffect(()=>{
        const fetchHTML = async () => {
            if (pendingReq.current !== null) {
                logger.debug(`Problem Iframe: Cancelling request for problem #${pendingReq.current.problemId} workbook #${pendingReq.current.workbookId}`);
                pendingReq.current.cancelled = true;
            }
            const currentReq = {problemId: problem.id, workbookId} as PendingRequest;
            pendingReq.current = currentReq;

            const rendererHTML = await getHTML();

            if (currentReq.cancelled) {
                logger.debug(`Problem Iframe: The request for problem #${problem.id} and workbook #${workbookId} was cancelled early.`);
                return;
            } else if (_.isNil(rendererHTML)) {
                // Preview Problems won't return a rendererHTML when the path is bad.
                if (_.isNil(previewPath) && _.isNil(previewProblemSource)) {
                    logger.error(`Problem Iframe: Request for problem #${problem.id} came back null`);
                }
                return;
            } else {
                pendingReq.current = null;
                // We need to reset the error state since a new call means no error
                setAlert({
                    variant: 'info',
                    message: ''
                });
                setRenderedHTML(rendererHTML);
            }

        };

        // If you don't reset the rendered html you won't get the load event
        // Thus if you go to an error state and back to the success state
        // The rendered html will never call load handler which will never stop loading
        setRenderedHTML('');
        // srcdoc='' triggers onLoad with setLoading(false) so setLoading(true) isn't effective until now
        setLoading(true);

        fetchHTML();

        // when problem changes, reset lastsubmitted and lastsaved
        setLastSubmittedAt?.(null);
        setLastSavedAt?.(null);
        setLastSubmission({});
    }, [problem, problem.id, workbookId, previewPath, previewProblemSource, previewSeed]);

    const getHTML = async () => {
        logger.debug('ProblemIframe: Getting new renderedHTML.');
        try {
            let res;

            if (previewPath || previewProblemSource) {
                res = await postPreviewQuestion({
                    webworkQuestionPath: previewPath,
                    problemSeed: previewSeed,
                    problemSource: previewProblemSource,
                    showHints: previewShowHints,
                    showSolutions: previewShowSolutions
                });
            } else {
                res = await getQuestion({
                    id: problem.id,
                    userId,
                    workbookId,
                    studentTopicAssessmentInfoId,
                    readonly
                });
            }
            return res.data.data.rendererData.renderedHTML as string;

        } catch (e) {
            setAlert({
                variant: 'danger',
                message: e.message
            });
            if (!BackendAPIError.isBackendAPIError(e) || (e.status !== 200 && e.status !== 400)) {
                logger.error(`An error occurred with retrieving ${(previewPath || previewProblemSource) ? 'a preview' : 'a problem'}. ${e.message}`);
            }

            setLoading(false);
        }
    };

    const isPrevious = (_value: any, key: string): boolean => {
        return /^previous_/.test(key);
    };

    const updateSubmitActive = _.throttle(() => {
        const submitButtons = iframeRef.current?.contentWindow?.document.getElementsByName('submitAnswers') as NodeListOf<HTMLButtonElement>;
        const problemForm = iframeRef.current?.contentWindow?.document.getElementById('problemMainForm') as HTMLFormElement;
        // called only onLoad or after interaction with already loaded srcdoc - so form will exist, unless bad problemPath
        // no logger.error because exam problems (and static problems) will not have 'submitAnswers'
        if (_.isNil(submitButtons) || _.isNil(problemForm)) {return;}

        const currentState = _.omitBy(formDataToObject(new FormData(problemForm)), isPrevious);
        const previousState = _.omitBy(lastSubmission, isPrevious);
        const isClean = _.isEqual(currentState, previousState);

        submitButtons.forEach((button: HTMLButtonElement) => {
            const valueStashAttributeName = 'value-stash';
            const valueStashAttributeContents = button.getAttribute(valueStashAttributeName);
            const valueContents = button.getAttribute('value');
            if (isClean) {
                if (!button.disabled) {
                    button.setAttribute('disabled','true');
                    // invisibly stash the button's label (in case there are multiple submit buttons)
                    if (valueContents){
                        button.setAttribute(valueStashAttributeName, valueContents);
                        button.setAttribute('value', 'Submitted');
                    } else {
                        logger.error('Inconceivable! Submit button has no value contents.');
                    }
                }
            } else {
                if (button.disabled) {
                    button.removeAttribute('disabled');
                    if (valueStashAttributeContents) {
                        // put it back and clear the stash - just in case
                        button.setAttribute('value', valueStashAttributeContents);
                        button.removeAttribute(valueStashAttributeName);
                    }
                }
            }
        });
    }, 100, {leading:true, trailing:true});

    const formDataToObject = (formData: FormData) => {
        let object:any = {};
        // downstream iterator error
        // @ts-ignore
        for(let pair of formData.entries()) {
            if (_.isUndefined(object[pair[0]])) {
                object[pair[0]] = pair[1];
            } else {
                if(!_.isArray(object[pair[0]])) {
                    object[pair[0]] = [object[pair[0]]];
                }
                object[pair[0]].push(pair[1]);
            }
        }
        return object;
    };

    async function prepareAndSubmit(problemForm: HTMLFormElement, clickedButton?: HTMLButtonElement) {
        const submitAction = (window as any).submitAction;
        if(typeof submitAction === 'function') submitAction(); // this is a global function from renderer - prepares form field for submit

        let formData = new FormData(problemForm);
        if (!_.isNil(clickedButton)) {
            // current state will never match submission unless we save it before including clickedButton
            // but we only want to save the current state if the button was 'submitAnswers'
            const saveMeLater = formDataToObject(formData);
            formData.set(clickedButton.name, clickedButton.value);
            try {
                let result: any;
                if (_.isNil(previewPath) && _.isNil(previewProblemSource)) {
                    result = await postQuestionSubmission({
                        id: problem.id,
                        data: formData,
                    });
                } else {
                    result = await postPreviewQuestion({
                        webworkQuestionPath: previewPath,
                        problemSeed: previewSeed,
                        formData,
                        problemSource: previewProblemSource,
                        showHints: previewShowHints,
                        showSolutions: previewShowSolutions
                    });
                }

                if(_.isNil(iframeRef?.current)) {
                    logger.error('Hijacker: Could not find the iframe ref');
                    setAlert({
                        variant: 'danger',
                        message: 'There was an error rendering this problem.'
                    });
                    return;
                }

                setRenderedHTML(result.data.data.rendererData.renderedHTML);

                if (clickedButton.name === 'submitAnswers'){
                    setProblemStudentGrade(result.data.data.studentGrade);
                    setLastSubmission(saveMeLater);
                    setLastSubmittedAt?.(moment());
                }
            } catch (e) {
                setAlert({
                    variant: 'danger',
                    message: e.message
                });
                return;
            }
        } else {
            if (_.isNil(problem.grades)) {return;} // TODO: impossi-log logger.error()
            if (_.isNil(problem.grades[0])) {return;} // not enrolled - do not save
            if (_.isNil(problem.grades[0].id)) {
                // TODO: impossi-log logger.error()
                setAlert({
                    variant: 'danger',
                    message: `No grade id found for this problem #${problem.id}`
                });
                return;
            }
            const reqBody = {
                currentProblemState: _.omit(formDataToObject(formData), 'answersSubmitted')
            };

            try {
                const result = (_.isNil(problem.grades[0].gradeInstances) || problem.grades[0].gradeInstances.length === 0) ?
                    await putQuestionGrade({
                        id: problem.grades[0].id,
                        data: reqBody
                    }) :
                    await putQuestionGradeInstance({
                        id: problem.grades[0].gradeInstances[0].id,
                        data: reqBody
                    });

                if (result.data.data.updatesCount > 0) {
                    setLastSavedAt?.(moment());
                }
            } catch (e) {
                setAlert({
                    variant: 'danger',
                    message: e.message
                });
                return;
            }
        }
    }

    function insertListeners(problemForm: HTMLFormElement) {
        const debouncedSaveHandler = _.debounce(prepareAndSubmit, 2000, { leading: false, trailing: true });
        const debouncedSubmitHandler = _.debounce(prepareAndSubmit, 300, { leading: true, trailing: false });

        // submission of problems will trigger updateSubmitActive @onLoad
        // because re-submission of identical answers is blocked, we expect srcdoc to change
        problemForm.addEventListener('submit', (event: { preventDefault: () => void; }) => {
            event.preventDefault();
            const clickedButton = problemForm.querySelector('.btn-clicked') as HTMLButtonElement;
            debouncedSubmitHandler(problemForm, clickedButton);
        });

        problemForm.addEventListener('input', () => {
            // updating submit button is throttled - so don't worry onInput spam
            updateSubmitActive();
            // we don't want to save while edits are in progress, so debounce
            debouncedSaveHandler(problemForm);
        });

        // TODO: remove once MathQuill events properly bubble
        // solves two issues - backspace nor mq-menu buttons trigger input/update
        // fires too often, onFocus etc - throttle handles it
        const iframeWindow = iframeRef?.current?.contentWindow as any | null | undefined;
        currentMutationObserver.current?.disconnect();
        (currentMutationObserver.current as any) = new MutationObserver(updateSubmitActive);
        iframeWindow.jQuery('#problemMainForm span.mq-root-block').each( (_index: number, subElm: HTMLSpanElement) => {
            currentMutationObserver.current?.observe(subElm, {
                childList: true,
                subtree: false,
                attributes: false,
                characterData: false
            });
        });
    }

    const onLoadHandlers = async () => {
        const iframeDoc = iframeRef.current?.contentDocument;
        const iframeWindow = iframeRef?.current?.contentWindow as any | null | undefined;

        if (!iframeDoc) return; // this will prevent empty renderedHTML

        const body = iframeDoc?.body;
        if (body === undefined) {
            logger.error('Couldn\'t access body of iframe');
            return;
        }

        let problemForm = iframeWindow?.document.getElementById('problemMainForm') as HTMLFormElement;
        if (!_.isNil(problemForm)) {
            // check that the submit url is accurate
            const submitUrl = problemForm.getAttribute('action');
            const checkId = submitUrl?.match(/\/backend-api\/courses\/question\/([0-9]+)\?/);
            if (checkId && parseInt(checkId[1],10) !== problem.id) {
                // if this still happens, we have bigger problems
                logger.error(`Something went wrong. Problem #${problem.id} is rendering a form with url: ${submitUrl}`);
                setAlert({
                    variant: 'danger',
                    message: `This problem ID (${problem.id}) is out of sync.`
                });
            }
            insertListeners(problemForm);
            updateSubmitActive();
        } else {
            if (renderedHTML !== '') {
                logger.error(`This problem has no problemMainForm: ${renderedHTML}`); // should NEVER happen when renderedHTML is non-empty
            }
        }

        const ww_applet_list = iframeWindow?.ww_applet_list;
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
            await Promise.all(promises);
        }

        setRenderedHTML((renderedHTML: string): string => {
            if (renderedHTML !== '') {
                iframeDoc?.dispatchEvent(new Event('Rederly Loaded'));
                setLoading(false);
            }
            return renderedHTML;
        });
    };

    return (
        <>
            { loading && <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>}
            <Alert variant={alert.variant} show={alert.message.length > 0}>{alert.message} -- Please refresh your page.</Alert>
            <IframeResizer
                // Using onInit instead of ref because:
                // ref never get's set and a warning saying to use `forwardRef` comes up in the console
                // Using forwardRef does not give you access to the iframe, rather it gives you access to 3 or 4 methods and properties (like `sendMessage`)
                onInit={(iframe: IFrameComponent) => {
                    if (iframeRef.current !== iframe) {
                        // TODO do we need to unset the iframeref? As of right now it should not be required since it is always present within the component
                        // If using dom elements the useRef is "Read Only", however I want control!
                        (iframeRef as any).current = iframe;
                        // On first load onLoadHandlers is called before the reference is set
                        onLoadHandlers();
                    } else {
                        // TODO I would like a logging framework that stripped these
                        // logger.debug('Reference did not change, do not call on load, that is a workaround for first load anyway');
                    }
                }}
                title='Problem Frame'
                style={{ width: '100%', height: height, border: 'none', minHeight: readonly ? '' : '350px', visibility: (loading || alert.message.length > 0) ? 'hidden' : 'visible'}}
                sandbox='allow-same-origin allow-forms allow-scripts allow-popups'
                srcDoc={renderedHTML}
                onLoad={onLoadHandlers}
                checkOrigin={false}
                scrolling={false}
            />
        </>
    );
};

export default ProblemIframe;
