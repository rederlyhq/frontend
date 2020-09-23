import React, { useRef, useEffect, useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import AxiosRequest from '../Hooks/AxiosRequest';
import _ from 'lodash';
import { Spinner } from 'react-bootstrap';
import * as qs from 'querystring';
import { postQuestionSubmission, putQuestionGrade } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import moment from 'moment';
import { useCurrentProblemState } from '../Contexts/CurrentProblemState';
import { xRayVision } from '../Utilities/NakedPromise';
import IframeResizer, { IFrameComponent } from 'iframe-resizer-react';

interface ProblemIframeProps {
    problem: ProblemObject;
    setProblemStudentGrade: (val: any) => void;
    workbookId?: number;
    readonly?: boolean;
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
    setProblemStudentGrade,
    workbookId,
    readonly = false,
}) => {
    const iframeRef = useRef<IFrameComponent>(null);
    const [renderedHTML, setRenderedHTML] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [height, setHeight] = useState('100vh');

    const { setLastSavedAt, setLastSubmittedAt } = useCurrentProblemState();

    useEffect(()=>{
        setLoading(true);
        // We need to reset the error state since a new call means no error
        setError('');
        // If you don't reset the rendered html you won't get the load event
        // Thus if you go to an error state and back to the success state
        // The rendered html will never call load handler which will never stop loading
        setRenderedHTML('');
        (async () => {
            try {
                let queryString = qs.stringify(_({
                    workbookId,
                    readonly
                }).omitBy(_.isUndefined).value());
                if (!_.isEmpty(queryString)) {
                    queryString = `?${queryString}`;
                }
                const res = await AxiosRequest.get(`/courses/question/${problem.id}${queryString}`);
                // TODO: Error handling.
                setRenderedHTML(res.data.data.rendererData.renderedHTML);
            } catch (e) {
                setError(e.message);
                console.error(e);
                setLoading(false);
            }
        })();
        // when problem changes, reset lastsubmitted and lastsaved
        setLastSubmittedAt?.(null);
        setLastSavedAt?.(null);
    }, [problem.id]);

    const recalculateHeight = () => {
        console.log('onresize was called from the iframe');
        const iframeDoc = iframeRef.current?.contentDocument;
        const scrollHeight = iframeDoc?.body.scrollHeight;
        if (!scrollHeight) {
            console.log('Problem iframe did not return a valid height on load.');
            return;
        }
        console.log(`Setting Height to ${scrollHeight}`);
        setHeight(`${scrollHeight}px`);
    };

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
            formData.set(clickedButton.name, clickedButton.value);
            try {
                const result = await postQuestionSubmission({
                    id: problem.id,
                    data: formData,
                });
                if(_.isNil(iframeRef?.current)) {
                    console.error('Hijacker: Could not find the iframe ref');
                    setError('An error occurred');
                    return;
                }
                setRenderedHTML(result.data.data.rendererData.renderedHTML);
                setProblemStudentGrade(result.data.data.studentGrade);
                setLastSubmittedAt?.(moment());
            } catch (e) {
                setError(e.message);
                return;
            }
        } else {
            if (_.isNil(problem.grades)) {return;} // TODO: impossi-log console.error()
            if (_.isNil(problem.grades[0])) {return;} // not enrolled - do not save
            if (_.isNil(problem.grades[0].id)) {
                // TODO: impossi-log console.error()
                setError(`No grades id for problem #${problem.id}`);
                return;
            }    
            const reqBody = {
                currentProblemState: formDataToObject(formData)
            };
            try {
                const result = await putQuestionGrade({
                    id: problem.grades[0].id, 
                    data: reqBody
                });
                if (result.data.data.updatesCount > 0) {
                    setLastSavedAt?.(moment());
                }
            } catch (e) {
                setError(e.message);
                return;
            }
        }
    }

    function insertListener(problemForm: HTMLFormElement) {
        problemForm.addEventListener('submit', _.debounce((event: { preventDefault: () => void; }) => {
            event.preventDefault();
            if (_.isNil(problemForm)) {
                console.error('Hijacker: Could not find the form when submitting the form');
                setError('An error occurred');
                return;
            }
            let clickedButton = problemForm.querySelector('.btn-clicked') as HTMLButtonElement;
            if (_.isNil(clickedButton)) {
                setError('Hijacker: An error occurred');
                console.error('Could not find the button that submitted the form');
                return;
            }
            prepareAndSubmit(problemForm, clickedButton);
        }, 4000, {leading: true, trailing:false}));

        problemForm.addEventListener('input', _.debounce(() => {
            if (_.isNil(problemForm)) {
                console.error('Hijacker: Could not find the form when submitting the form');
                setError('An error occurred');
                return;
            }
            prepareAndSubmit(problemForm);
        }, 2000));
    }

    const onLoadHandlers = async () => {
        if (_.isEmpty(renderedHTML)) return; // don't hang around on first visit
        const iframeDoc = iframeRef.current?.contentDocument;
        const iframeWindow = iframeRef?.current?.contentWindow as any | null | undefined;

        if (!iframeDoc) return;

        const body = iframeDoc?.body;
        if (body === undefined) {
            console.log('Couldn\'t access body of iframe');
            return;
        }

        // HTMLCollectionOf is not iterable by default in Typescript.
        // const forms = iframeDoc.getElementsByTagName('form');
        // _.forEach(forms, form => form.addEventListener('submit', hijackFormSubmit));
        let problemForm = iframeWindow?.document.getElementById('problemMainForm') as HTMLFormElement;
        if (!_.isNil(problemForm)) {
            insertListener(problemForm);
        } else {
            console.error('this problem has no problemMainForm'); // should NEVER happen in WW
        }

        console.log('Checking MathJax...');
        const MathJax = iframeWindow?.MathJax;
        if (MathJax !== undefined) {
            console.log('Found MathJax!');
            MathJax.Hub?.Register?.StartupHook('End', function () {
                console.log('Recalculating because MathJax has finished computing.');
                recalculateHeight();
            });
        } else {
            console.log('Couldn\'t find MathJax!');
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
                // null check getApplet
                getApplet(key).registerUpdateListener?.(_.debounce(()=>{
                    ww_applet_list[key].submitAction();
                    problemForm.dispatchEvent(new Event('input'));
                },3000));
            }); 
            await Promise.all(promises);       
        }

        setLoading(false);
    };

    return (
        <>
            { loading && <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>}
            {error && <div>{error}</div>}
            <IframeResizer
                // Using onInit instead of ref because:
                // ref never get's set and a warning saying to use `forwardRef` comes up in the console
                // Using forwardRef does not give you access to the iframe, rather it gives you access to 3 or 4 methods and properties (like `sendMessage`)
                onInit={(iframe: IFrameComponent) => {
                    // TODO do we need to unset the iframeref? As of right now it should not be required since it is always present within the component
                    // If using dom elements the useRef is "Read Only", however I want control!
                    (iframeRef as any).current = iframe;
                    // On first load onLoadHandlers is called before the reference is set
                    onLoadHandlers();
                }}
                title='Problem Frame'
                style={{width: '100%', height: height, border: 'none', minHeight: '350px', visibility: (loading || error) ? 'hidden' : 'visible'}}
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
