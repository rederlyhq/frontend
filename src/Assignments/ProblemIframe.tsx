import React, { useRef, useEffect, useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import AxiosRequest from '../Hooks/AxiosRequest';
import axios from 'axios';
import { fromEvent } from 'from-form-submit';
import _ from 'lodash';

interface ProblemIframeProps {
    problem: ProblemObject;
}

/**
 * The most important part- rendering the problem.
 * We used the document.write strategy before for backwards compatibility, but modern browsers now block it.
 * We _could_ also set the form to just render the URL directly from the server, but this provides more flexibility
 * with further work on the JSON data.
 * Important reference: https://medium.com/the-thinkmill/how-to-safely-inject-html-in-react-using-an-iframe-adc775d458bc
 */
export const ProblemIframe: React.FC<ProblemIframeProps> = ({problem}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [renderedHTML, setRenderedHTML] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [height, setHeight] = useState('100vh');

    useEffect(()=>{
        setLoading(true);
        (async () => {
            try {
                const res = await AxiosRequest.get(`/courses/question/${problem.id}`);
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

    const hijackFormSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const obj = fromEvent(e);
        console.log('Hijacking the form!');
        console.log(obj);
        const formData = new URLSearchParams();
        // Yes, appending in a different order is intentional.
        _.each(obj, (key, val) => formData.append(val, key));

        try {
            const res = await AxiosRequest.post(`/courses/question/${problem.id}`, 
                formData, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
            console.log(res);
            setRenderedHTML(res.data.data.rendererData.renderedHTML);
        } catch (e) {
            console.log(e);
            setRenderedHTML(e);
        } finally {
            setLoading(false);
        }
        return true;
    };

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
        const forms = iframeDoc.getElementsByTagName('form');
        _.forEach(forms, form => form.onsubmit = hijackFormSubmit);

        console.log('Checking MathJax...');
        const MathJax = (iframeRef.current?.contentWindow as any)?.MathJax;
        if (MathJax !== undefined) {
            console.log('Found MathJax!');
            MathJax.Hub.Register.StartupHook('End', function () {
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
            { loading && <div>Loading...</div>}
            {error ? <div>{error}</div> :
                <iframe 
                    title='Problem Frame'
                    ref={iframeRef} 
                    style={{width: '100%', height: height, border: 'none', minHeight: '350px', visibility: loading ? 'hidden' : 'visible'}}
                    sandbox='allow-same-origin allow-forms allow-scripts allow-popups'
                    srcDoc={renderedHTML}
                    onLoad={onLoadHandlers}
                />
            }
        </>
    );
};

export default ProblemIframe;