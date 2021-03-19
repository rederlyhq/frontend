import React, { useRef, useEffect } from 'react';
import ReactQuill, { Quill, ReactQuillProps } from 'react-quill';
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

interface QuillControlledEditorProps {
    onChange: (value: ReactQuillProps['value']) => void;
    onBlur: ReactQuillProps['onBlur'];
    value: ReactQuillProps['value'];
    defaultValue?: ReactQuillProps['defaultValue'];
    onSave?: (saveData: Object)=>any;
}

export const QuillControlledEditor: React.FC<QuillControlledEditorProps> = ({onSave, onChange, onBlur, value, defaultValue}) => {
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
                ['\\frac{x}{y}','\\frac'],
                ['|\\text{x}|', '|'],
                ['\\text{x}^\\text{y}', '^'],
                ['\\infty', '\\infty'],
                ['\\pi', '\\pi'],
                ['|', '|'],
                ['\\cup', '\\cup'],
            ],
            displayHistory: true,
            historyCacheKey: '__rederly_math_history_cachekey_',
            historySize: 3 
        });
    }, []);

    const onClickedSave = () => {
        const delta = quill.current?.getEditor().getContents();
        onSave?.(delta ?? {});
    };

    const wrappedOnChange = () => {
        const delta = quill.current?.getEditor().getContents();
        onChange(delta);
    };

    return <Grid container item md={12}>
        <Grid item id='quillgrid' md={12}>
            <ReactQuill
                scrollingContainer={'#quillgrid'}
                bounds={'#quillgrid'}
                style={{
                    width: '100%',
                    padding: '0% 1%',
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
                onChange={wrappedOnChange}
                onBlur={onBlur}
                value={value}
                defaultValue={defaultValue}
                placeholder='Descriptions or instructions for this Topic can be added here. They will be displayed on top of every problem in this topic.'
            />
        </Grid>
        {onSave && <Button fullWidth variant='contained' onClick={onClickedSave}>Submit</Button>}
    </Grid>;
};

export default QuillControlledEditor;