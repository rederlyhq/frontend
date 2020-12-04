import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import PDFOnePage from './PDFOnePage';
import { usePrintLoadingContext, PrintLoadingActions } from '../../Contexts/PrintLoadingContext';
import pdfjs, { getDocument } from 'pdfjs-dist/webpack';
import logger from '../../Utilities/Logger';

interface PDFInlineRenderProps {
    url: string;
}

export const PDFInlineRender: React.FC<PDFInlineRenderProps> = ({url}) => {
    const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy | null>(null);
    const {dispatch} = usePrintLoadingContext();

    useEffect(() => {
        const loadPDF = (async () => {
            // TODO: We can hook into onProgress here.
            const doc = await getDocument({url}).promise;
            logger.info(`Adding expectation for ${doc.numPages} pages of pdf`);
            dispatch?.({type: PrintLoadingActions.ADD_EXPECTED_PROMISE_COUNT, expected: doc.numPages});
            setPdf(doc);
        })();

        logger.info('Adding promise for loading a PDF.');
        dispatch?.({
            type: PrintLoadingActions.ADD_PROMISE,
            payload: loadPDF,
        });
    }, [url]);

    return (
        <div>
            {
                pdf && _.range(pdf.numPages).map(index => (
                    <PDFOnePage pagePromise={pdf.getPage(index+1)} key={url + index}/>
                ))
            }
        </div>
    );
};

export default PDFInlineRender;
