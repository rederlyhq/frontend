import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import PDFOnePage from './PDFOnePage';
import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry');

interface PDFInlineRenderProps {
    url: string;
}

export const PDFInlineRender: React.FC<PDFInlineRenderProps> = ({url}) => {
    const [pdf, setPdf] = useState<pdfjs.PDFDocumentProxy | null>(null);

    useEffect(() => {
        pdfjs.getDocument({url}).promise.then(doc => {
            setPdf(doc);
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