import React, { useRef, useEffect, useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import AxiosRequest from '../Hooks/AxiosRequest';
import _ from 'lodash';
import { Spinner } from 'react-bootstrap';
import * as qs from 'querystring';

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
    readonly = false
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [renderedHTML, setRenderedHTML] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [height, setHeight] = useState('100vh');

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

    function insertListener() {
        // assuming global problemiframe - too sloppy?
        let problemForm = iframeRef?.current?.contentWindow?.document.getElementById('problemMainForm') as HTMLFormElement;
        // don't croak when the empty iframe is first loaded
        // problably not an issue for rederly/frontend
        if (_.isNil(problemForm)) {
            // This will happen, if you set error then it will never be true and breaks the page
            // setError('An error occurred');
            // console.error('Hijacker: Could not find the form to insert the listener');
            return;
        }
        problemForm.addEventListener('submit', (event: { preventDefault: () => void; }) => {
            event.preventDefault();
            if (_.isNil(problemForm)) {
                console.error('Hijacker: Could not find the form when submitting the form');
                setError('An error occurred');
                return;
            }
            let formData = new FormData(problemForm);
            let clickedButton = problemForm.querySelector('.btn-clicked') as HTMLButtonElement;
            if (_.isNil(clickedButton)) {
                setError('Hijacker: An error occurred');
                console.error('Could not find the button that submitted the form');
                return;
            }
            formData.set(clickedButton.name, clickedButton.value);
            const submiturl = problemForm.getAttribute('action');
            if(_.isNil(submiturl)) {
                setError('An error occurred');
                console.error('Hijacker: Couldn\'t find the submit URL');
                return;
            }
            const submit_params = {
                body: formData,
                method: 'post',
            };
            fetch(submiturl, submit_params).then( function(response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Could not submit your answers: ' + response.statusText);
                }
            }).then( function(res) {
                if(_.isNil(iframeRef?.current)) {
                    console.error('Hijacker: Could not find the iframe ref');
                    setError('An error occurred');
                    return;
                }
                setRenderedHTML(res.data.rendererData.renderedHTML);
                setProblemStudentGrade(res.data.studentGrade);
            }).catch( function(e) {
                console.error(e);
                setError(e.message);
            });
        });
    }

    const onLoadHandlers = () => {
        const iframeDoc = iframeRef.current?.contentDocument;

        if (!iframeDoc) return;

        const body = iframeDoc?.body;
        if (body === undefined) {
            console.log('Couldn\'t access body of iframe');
            return;
        }

        body.onresize = recalculateHeight;

        // HTMLCollectionOf is not iterable by default in Typescript.
        // const forms = iframeDoc.getElementsByTagName('form');
        // _.forEach(forms, form => form.addEventListener('submit', hijackFormSubmit));
        insertListener();

        console.log('Checking MathJax...');
        const MathJax = (iframeRef.current?.contentWindow as any)?.MathJax;
        if (MathJax !== undefined) {
            console.log('Found MathJax!');
            MathJax.Hub?.Register?.StartupHook('End', function () {
                console.log('Recalculating because MathJax has finished computing.');
                recalculateHeight();
            });
        } else {
            console.log('Couldn\'t find MathJax!');
        }

        setLoading(false);
    };

    return (
        <>
            { loading && <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>}
            {error && <div>{error}</div>}
            <iframe
                title='Problem Frame'
                ref={iframeRef}
                style={{width: '100%', height: height, border: 'none', minHeight: '350px', visibility: (loading || error) ? 'hidden' : 'visible'}}
                sandbox='allow-same-origin allow-forms allow-scripts allow-popups'
                srcDoc={renderedHTML}
                onLoad={onLoadHandlers}
            />
        </>
    );
};

export default ProblemIframe;
