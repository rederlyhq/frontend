import React, { useEffect, useState, forwardRef } from 'react';
import heic2any from 'heic2any';
import logger from '../Utilities/Logger';

interface HeicProps {
    url: string;
    title: string;
}

export const Heic = forwardRef<HTMLImageElement, HeicProps>(
    function Heic({url, title}, ref) {
        const [dataUrl, setDataUrl] = useState<string>();

        useEffect(()=>{
            (async () => {
                try {
                    const res = await fetch(url);
                    const blob = await res.blob();
                    const png = await heic2any({blob});
                    const dataUrl = URL.createObjectURL(png);
                    setDataUrl(dataUrl);
                } catch (e) {
                    logger.warn(`HEIC file failed to load: ${e.message}`);
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
            />
        );
    });

export default Heic;