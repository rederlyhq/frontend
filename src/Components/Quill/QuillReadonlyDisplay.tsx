import React, { useRef, useEffect } from 'react';
import ReactQuill, {Quill, ReactQuillProps} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// import 'mathquill/build/mathquill';
import { Button, Grid } from '@material-ui/core';
import mathquill4quill from 'mathquill4quill';
import 'mathquill4quill/mathquill4quill.css';
import _ from 'lodash';
import logger from '../../Utilities/Logger';

import './QuillOverrides.css';

// Load Katex with this module
import katex from 'katex';
import 'katex/dist/katex.min.css';

window.katex = katex;

interface QuillReadonlyDisplayProps {
    content: ReactQuillProps['value'];
}

export const QuillReadonlyDisplay: React.FC<QuillReadonlyDisplayProps> = ({ content }) => {
    const quill = useRef<ReactQuill | null>();

    useEffect(()=>{
        if (_.isNil(quill.current)) {
            logger.warn('Component mounted but cannot initialize MathQuill cause Quill is undefined.');
            return;
        }

        const enableMathQuillFormulaAuthoring = mathquill4quill({ Quill });

        enableMathQuillFormulaAuthoring(quill.current.editor);
    }, []);

    return <ReactQuill
        readOnly
        style={{
            width: '100%',
        }}
        ref={r => quill.current = r}
        // theme={'snow'} 
        modules={{
            toolbar: false
        }}
        defaultValue={content}
    />;
};
