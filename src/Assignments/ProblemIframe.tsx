import React, { useRef, useEffect, useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import AxiosRequest from '../Hooks/AxiosRequest';

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

    const setScrollHeight = () => {
        const iframeDoc = iframeRef.current?.contentDocument;

        const body = iframeDoc?.body;
        if (body === undefined) {
            console.log('Couldn\'t access body of iframe');
            return;
        }

        body.onresize = () => {
            const scrollHeight = iframeDoc?.body.scrollHeight;
            if (!scrollHeight) {
                console.log('Problem iframe did not return a valid height on load.');
                return;
            }
            setHeight(`${scrollHeight}px`);
        };
        setLoading(false);
    };

    return (
        <>
            { loading && <div>Loading...</div>}
            {error ? <div>{error}</div> :
                <iframe 
                    title='Problem Frame'
                    ref={iframeRef} 
                    style={{width: '100%', height: height, border: 'none', visibility: loading ? 'hidden' : 'visible'}}
                    sandbox='allow-same-origin allow-forms allow-scripts allow-popups'
                    srcDoc={renderedHTML}
                    onLoad={setScrollHeight}
                />
            }
        </>
    );
};

export default ProblemIframe;