import React, { useRef, useEffect, useState } from 'react';
import ReactQuill, { Quill, ReactQuillProps } from 'react-quill';
// import DragAndDropModule from 'quill-drag-and-drop-module';
import 'react-quill/dist/quill.snow.css';
// import 'mathquill/build/mathquill';
import { Button, Grid } from '@material-ui/core';
import mathquill4quill from 'mathquill4quill';
import 'mathquill4quill/mathquill4quill.css';
import _ from 'lodash';
import logger from '../../Utilities/Logger';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import BlotFormatter, { DeleteAction, ImageSpec, ResizeAction } from 'quill-blot-formatter';


import './QuillOverrides.css';

// Load Katex with this module
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { putUploadWork, getGenericUploadURL } from '../../APIInterfaces/AWS/Requests/StudentUpload';
import AttachmentType from '../../Enums/AttachmentTypeEnum';
import { GenericConfirmAttachmentUploadOptions } from '../../APIInterfaces/BackendAPI/RequestTypes/CourseRequestTypes';
import { FaFileUpload } from 'react-icons/fa';
window.katex = katex;

Quill.register('modules/blotFormatter', BlotFormatter);

interface QuillControlledEditorProps {
    // Common props
    placeholder?: string;
    defaultValue?: ReactQuillProps['defaultValue'];
    attachmentType?: AttachmentType;
    uploadConfirmation?: (params: GenericConfirmAttachmentUploadOptions) => void;
    // Controlled variant only
    onChange?: (value: ReactQuillProps['value'] | null) => void;
    onBlur?: ReactQuillProps['onBlur'];
    value?: ReactQuillProps['value'];
    // Uncontrolled variant only
    onSave?: (saveData: ReactQuillProps['value'] | null)=>any;
}

class CustomImageSpec extends ImageSpec {
    getActions() {
        return [
            // The Align action requires additional configuration to fix with ReactQuill
            // See https://github.com/Fandom-OSS/quill-blot-formatter/issues/5
            // AlignAction, 
            DeleteAction, 
            ResizeAction];
    }
}

export const QuillControlledEditor: React.FC<QuillControlledEditorProps> = ({onSave, onChange, onBlur, value, defaultValue, placeholder, attachmentType, uploadConfirmation}) => {
    const quill = useRef<ReactQuill | null>();
    const [disabled, setDisabled] = useState<boolean>(true);

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

    const isQuillEmpty = () => {
        const delta = quill.current?.getEditor().getContents();
        
        if ((delta?.['ops'] || []).length > 1) {
            return false;
        }

        const text = quill.current?.getEditor().getText();
        return text === undefined || text.trim().length === 0;
    };

    const onClickedSave = () => {
        setDisabled(true);
        if (isQuillEmpty()) {
            onSave?.(null);
            return;
        }
        const delta = quill.current?.getEditor().getContents();
        onSave?.(delta ?? null);
    };

    const wrappedOnChange = () => {
        setDisabled(false);
        if (isQuillEmpty()) {
            onChange?.(null);
            return;
        }
        const delta = quill.current?.getEditor().getContents();
        console.log(delta);
        onChange?.(delta);
    };

    const onDrop: DropzoneOptions['onDrop'] = (files) => {
        files.forEach(async (file) => {
            // TODO: Fix to be generic
            try {
                const res = await getGenericUploadURL({type: attachmentType});
                const {uploadURL, cloudFilename} = res.data.data;
                
                await putUploadWork({
                    presignedUrl: uploadURL,
                    file: file,
                });
                
                uploadConfirmation?.({
                    attachment: {
                        cloudFilename: cloudFilename,
                        userLocalFilename: file.name,
                    }
                });
                const editor = quill.current?.getEditor();
                if (editor === undefined) {
                    logger.error('Editor is undefined when a drop occurred.');
                    return;
                }
                const range = editor.getSelection();

                if (file.type.startsWith('image')) {
                    editor.insertEmbed(range?.index ?? 0, 'image', `/uploads/workbook/${cloudFilename}`, 'user');
                } else {
                    editor.insertText(range?.index ?? 0, file.name, 'link', `/work/${cloudFilename}`, 'user');
                }
            } catch (e) {
                console.error(e);
            }
        });
    };

    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ onDrop,
        // accept: [],
        noClick: true,
        noKeyboard: true
    });

    return <Grid container item md={12}>
        <Grid item id='quillgrid' md={12} {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive && (
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    border: '5px dashed lightblue',
                    borderRadius: '3px',
                    textAlign: 'center',
                    zIndex: 2,
                    backgroundColor: 'white',
                    opacity: 0.9,
                }}
                >
                    <div style={{ position: 'relative', margin: '0 auto', top: '15%', fontSize: '1em' }}>
                        {/* Drop your archive file to import! */}
                        <FaFileUpload style={{ position: 'relative', margin: '0 auto', top: '15%', display: 'block', fontSize: '1em' }} />
                    </div>
                </div>
            )}
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
                        ['formula']
                    ],
                    blotFormatter: {
                        specs: [
                            CustomImageSpec,
                        ],
                        overlay: {
                            style: {
                                border: '2px solid red',
                            }
                        }
                    }
                }}
                // Controlled props have to conditionally be applied because
                // undefined values still count as values.
                {...(onChange ? {
                    onBlur: onBlur,
                    value: value,
                } : {})}
                // We use onChange to also throttle the save button, so even though it's really a controlled
                // feature, we need it here.
                onChange={wrappedOnChange}
                defaultValue={defaultValue}
                placeholder={placeholder ?? 'Descriptions or instructions for this Topic can be added here. They will be displayed on top of every problem in this topic.'}
            />
            {onSave && <Grid xs={12} style={{margin: '0% 1%'}}>
                <Button disabled={disabled} fullWidth color='primary' variant='contained' onClick={onClickedSave}>Save Feedback</Button>
            </Grid>}
        </Grid>
    </Grid>;
};

export default QuillControlledEditor;