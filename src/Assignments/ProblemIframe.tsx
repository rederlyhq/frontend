import React, { useRef, useEffect, useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import AxiosRequest from '../Hooks/AxiosRequest';

interface ProblemIframeProps {
    problem: ProblemObject;
}

export const ProblemIframe: React.FC<ProblemIframeProps> = ({problem}) => {
    const iframeRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(()=>{
        setLoading(true);
        (async () => {
            try {
                const res = await AxiosRequest.get(`/courses/question/${problem.id}`);
                console.log(res.data);

                if (!iframeRef) return;
                const current: any = iframeRef.current;
                console.log(current);
                if (!current) return;
                const iframeDoc: any = current.contentDocument;
                console.log(iframeDoc);
                if (!iframeDoc) return;
                iframeDoc.open();
                iframeDoc.write(res.data.data.rendererData.renderedHTML);
                iframeDoc.close();
            } catch (e) {
                setError(e.message);
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [iframeRef]);

    return (
        <>
            { loading ? <div>Loading...</div> :
                ( error ? <div>{error}</div> :
                    <iframe ref={iframeRef} style={{width: '100%', height: '100vh', border: 'none'}} />
                )
            }
        </>
    );
};

export default ProblemIframe;