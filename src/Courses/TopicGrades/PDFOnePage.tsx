import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import pdfjs from 'pdfjs-dist/webpack';
import {PDFPageProxy} from 'pdfjs-dist/types/display/api';
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFOnePageProps {
    pagePromise: pdfjs.PDFPromise<pdfjs.PDFPageProxy>;
}

export const PDFOnePage: React.FC<PDFOnePageProps> = ({pagePromise}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        pagePromise.then(page => {
            const canvas = canvasRef?.current?.getContext?.('2d');
            const viewport = page.getViewport({scale: 1});

            if (_.isNil(canvas) || _.isNil(canvasRef?.current)) {
                return;
            }
            canvasRef.current.width = viewport.width;
            canvasRef.current.height = viewport.height;

            page.render({
                canvasContext: canvas,
                viewport: viewport,
            });
        });
    }, [pagePromise, canvasRef]);

    return (
        <canvas ref={canvasRef}></canvas>
    );
};

export default PDFOnePage;