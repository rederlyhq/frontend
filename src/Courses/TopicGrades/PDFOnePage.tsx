import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import { usePrintLoadingContext, PrintLoadingActions } from '../../Contexts/PrintLoadingContext';
import pdfjs from 'pdfjs-dist/webpack';
import {PDFPageProxy} from 'pdfjs-dist/types/display/api';
import logger from '../../Utilities/Logger';
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFOnePageProps {
    pagePromise: pdfjs.PDFPromise<pdfjs.PDFPageProxy>;
}

export const PDFOnePage: React.FC<PDFOnePageProps> = ({pagePromise}) => {
    const {dispatch} = usePrintLoadingContext();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const loadPage = (async () => {
            const page = await pagePromise;
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
        })();

        logger.info('Adding a promise for one single Page.');
        dispatch?.({
            type: PrintLoadingActions.ADD_PROMISE,
            payload: loadPage,
        });
    }, [pagePromise, canvasRef]);

    return (
        <canvas ref={canvasRef}></canvas>
    );
};

export default PDFOnePage;