import React, { useEffect, useRef, useState } from 'react';
import heic2any from 'heic2any';
import logger from '../Utilities/Logger';

interface HeicProps {
    url: string;
    title: string;
}

export const Heic: React.FC<HeicProps> = ({url, title}) => {
    const [dataUrl, setDataUrl] = useState<string>();

    useEffect(()=>{
        logger.debug('HEIC USE EFFECT');

        (async () => {
            try {
                const res = await fetch(url);
                console.log(res);
                const blob = await res.blob();
                console.log(blob);
                const png = await heic2any({blob});
                console.log(png);
                const dataUrl = URL.createObjectURL(png);
                setDataUrl(dataUrl);
            } catch (e) {
                logger.warn(`HEIC file ${e.message}`);
            }
        })();
    }, [url]);

    return (
        <embed
            src={dataUrl}
            title={title}
            height={140}
            style={{objectFit: 'cover', width: '100%'}}
        />
    );
};

export default Heic;