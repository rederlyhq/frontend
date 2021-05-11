import React, { useEffect, useState, forwardRef } from 'react';
import heic2any from 'heic2any';
import logger from '../Utilities/Logger';

let currentHEICPromise: Promise<unknown> = Promise.resolve();
const sequentialHeic2any = (blob: Blob): Promise<Blob | Blob[]> => {
    // This is what we were originally doing, however we noticed that the browser waits for all to load before rendering anything
    // With this fix they lazy load in; so if it tiems out before all resourses are done you get some
    // return heic2any({ blob });
    const result = (async () => {
        try {
            await currentHEICPromise;
        } catch (e) {
            logger.warn('heic promise failed', e);
        }
        return heic2any({ blob });
    })();
    currentHEICPromise = result;
    return result;
};

interface HeicProps {
    url: string;
    title: string;
    [props: string]: any;
}

export const Heic = forwardRef<HTMLImageElement, HeicProps>(
    function Heic({url, title, ...props}, ref) {
        const [dataUrl, setDataUrl] = useState<string>('/heic-loading.png');

        useEffect(()=>{
            (async () => {
                try {
                    const res = await fetch(url);

                    if (res.headers.get('content-type') === 'image/jpeg') {
                        setDataUrl(url);
                        return;
                    }

                    const blob = await res.blob();
                    // const png = await heic2any({blob});
                    const png = await sequentialHeic2any(blob);
                    const dataUrl = URL.createObjectURL(png);
                    setDataUrl(dataUrl);
                } catch (e) {
                    logger.warn(`HEIC file failed to load: ${e.message}`);
                    setDataUrl('/heic-failed-load.png');
                }
            })();
        }, [url]);

        return (
            <img
                src={dataUrl}
                alt={title}
                title={title}
                style={{maxWidth: '100%'}}
                ref={ref}
                {...props}
            />
        );
    });

export default Heic;