import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry');

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