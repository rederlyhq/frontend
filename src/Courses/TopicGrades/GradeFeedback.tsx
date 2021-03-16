import React, { useRef, useEffect } from 'react';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// import 'mathquill/build/mathquill';
import { Button, Grid } from '@material-ui/core';
import mathquill4quill from 'mathquill4quill';
import 'mathquill4quill/mathquill4quill.css';
import _ from 'lodash';
import logger from '../../Utilities/Logger';

// Load Katex with this module
import katex from 'katex';
import 'katex/dist/katex.min.css';
window.katex = katex;

interface GradeFeedbackProps {

}

export const GradeFeedback: React.FC<GradeFeedbackProps> = () => {
    const quill = useRef<ReactQuill | null>();

    useEffect(()=>{
        if (_.isNil(quill.current)) {
            logger.warn('Component mounted but cannot initialize MathQuill cause Quill is undefined.');
            return;
        }

        const enableMathQuillFormulaAuthoring = mathquill4quill({ Quill });

        enableMathQuillFormulaAuthoring(quill.current.editor, {
            operators: [
                ['\\sqrt[n]{x}', '\\nthroot'], 
                ['\\frac{x}{y}','\\frac']
            ],
            displayHistory: true,
            historyCacheKey: '__rederly_math_history_cachekey_',
            historySize: 3 
        });
    }, []);

    return <Grid item id='quillgrid' md={12}>
        <ReactQuill
            bounds={'#quillgrid'}
            style={{
                height: '30vh',
                width: '100%'
            }}
            ref={r => quill.current = r}
            // theme={'snow'} 
            modules={{
                formula: true,
                toolbar: [                  
                    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                    ['blockquote', 'code-block'],
                    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                    ['formula']]
            }}
        />
        <Button onClick={()=>{}}>Insert Text</Button>
    </Grid>;
};
