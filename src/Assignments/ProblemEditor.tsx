import React, { useCallback, useEffect, useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import { TextField, Button, Grid, InputAdornment, IconButton, Tooltip } from '@material-ui/core';
import _ from 'lodash';
import logger from '../Utilities/Logger';
import ProblemIframe from './ProblemIframe';
import { Controller, useForm } from 'react-hook-form';
import {Controlled as CodeMirror} from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/perl/perl';
import 'codemirror/mode/javascript/javascript';
import { catalog, readProblem, saveProblem } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { nameof } from '../Utilities/TypescriptUtils';
import { FaCopy, FaDice, FaFileUpload } from 'react-icons/fa';
import path from 'path';
import { Alert, Modal } from 'react-bootstrap';
import useAlertState from '../Hooks/useAlertState';
import { useQuery } from '../Hooks/UseQuery';
import { motion, useCycle } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import localPreferences from '../Utilities/LocalPreferences';
const { session } = localPreferences;

const defaultLoadPath = 'private/templates/barebones.pg';

const dummyProblem = new ProblemObject();
interface PreviewProps {
    seedValue: number;
    problemSource?: string;
    showHints: boolean;
    showSolutions: boolean;
}

export interface ProblemEditorInputs extends PreviewProps {
    loadPath: string;
    userPath: string;
}

export const ProblemEditor: React.FC = () => {
    const [flipped, cycleFlipped] = useCycle(-1, 1);
    const queryParams = useQuery();
    const savePathAdornmentText = `private/my/${session.userUUID}/`;
    const getSavePathForLoadPath = (userPath: string): string => {
        let result = userPath;
        if (userPath.startsWith(savePathAdornmentText)) {
            result = userPath.substring(savePathAdornmentText.length);
        } else if (userPath.startsWith('private/templates')) {
            result = path.basename(userPath);
        } else {
            logger.debug('User path stays the same');
        }
        return result;
    };

    const [alertState, setAlertState] = useAlertState();
    const [previewState, setPreviewState] = useState<PreviewProps>({
        seedValue: 1,
        showHints: false,
        showSolutions: false,
        problemSource: undefined
    });

    const [myCatalog, setMyCatalog] = useState<Array<string>>([]);
    const [catalogOpen, setCatalogOpen] = useState<boolean>(false);

    const loadPath = queryParams.get('loadPath')?.fromBase64() ?? defaultLoadPath;
    const problemEditorForm = useForm<ProblemEditorInputs>({
        mode: 'onSubmit', 
        shouldFocusError: true,
        defaultValues: {
            loadPath: loadPath,
            userPath: getSavePathForLoadPath(loadPath),
            ...previewState
        },
    });

    const { register, control } = problemEditorForm;

    const render = () => {
        setPreviewState({
            seedValue: problemEditorForm.getValues().seedValue,
            showHints: problemEditorForm.getValues().showHints,
            showSolutions: problemEditorForm.getValues().showSolutions,
            problemSource: problemEditorForm.getValues().problemSource,
        });
    };

    const onDrop = useCallback(acceptedFiles => {
        (async () => {
            if (_.isNil(acceptedFiles.first)) {
                return;
            }
            const path: string = acceptedFiles.first.path;
            // The renderer does not like when there are return characters in there
            // I think this is a windows line ending issue so it only matters on file upload
            const problemSource: string = (await acceptedFiles.first.text()).replace(/\r/gm, '');
            problemEditorForm.setValue(nameof<ProblemEditorInputs>('problemSource'), problemSource);
            const userPath = getSavePathForLoadPath(path);
            problemEditorForm.setValue(nameof<ProblemEditorInputs>('userPath'), userPath);
            problemEditorForm.setValue(nameof<ProblemEditorInputs>('loadPath'), `${savePathAdornmentText}${userPath}`);
            render();
        })();
    }, [problemEditorForm, savePathAdornmentText, getSavePathForLoadPath, render, savePathAdornmentText]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDrop,
        accept: '.pg',
        multiple: false
    });

    const load = async () => {
        try {
            const result = await readProblem({
                filePath: problemEditorForm.getValues().loadPath
            });
            problemEditorForm.setValue(nameof<ProblemEditorInputs>('problemSource'), result.data.data.problemSource);
            const userPath = getSavePathForLoadPath(problemEditorForm.getValues().loadPath);
            problemEditorForm.setValue(nameof<ProblemEditorInputs>('userPath'), userPath);
            render();
        } catch(e) {
            logger.error('problemEditor: load: ', e.message);
            setAlertState({
                message: e.message,
                variant: 'danger'
            });
        }
    };

    const save = async () => {
        try {
            const { problemSource } = problemEditorForm.getValues();
            if(_.isNil(problemSource)) {
                return;
            }
            const result = await saveProblem({
                problemSource: problemSource,
                relativePath: problemEditorForm.getValues().userPath,
            });
            const savedPath = result.data.data.filePath;
            problemEditorForm.setValue(nameof<ProblemEditorInputs>('loadPath'), savedPath);
            setMyCatalog(myCatalog => [...myCatalog, savedPath]);
            setAlertState({
                message: 'Saved successfully',
                variant: 'success'
            });            
            render();
        } catch(e) {
            logger.error('problemEditor: save:', e.message);
            setAlertState({
                message: e.message,
                variant: 'danger'
            });
        }
    };

    const getCatalog = async () => {
        try {
            const result = await catalog();
            setMyCatalog([...myCatalog, ...result.data.data.problems]);
        } catch(e) {
            logger.error('problemEditor: getCatalog:', e.message);
            setAlertState({
                message: e.message,
                variant: 'danger'
            });
        }
    };

    const copySavePathToClipboard = () => {
        navigator.clipboard.writeText(`${savePathAdornmentText}${problemEditorForm.getValues().userPath}`);
    };

    const onFormChange = () => {
        setAlertState({
            message: '',
            variant: 'info'
        });
    };

    useEffect(() => {
        (async () => {
            const loadPromise = load();
            const catalogPromise = getCatalog();
            await Promise.all([loadPromise, catalogPromise]);    
        })();
    }, []);


    return (<form onChange={onFormChange}>
        <Modal
            onShow={()=>setCatalogOpen(true)}
            onHide={()=>setCatalogOpen(false)}
            show={catalogOpen}
            className='fullscreen-modal'
        >
            <Modal.Header closeButton>
                <h6>My problems</h6>
            </Modal.Header>
            <Modal.Body>
                <ul style={{
                    padding: '10px',
                    listStyleType: 'none'
                }}>
                    {myCatalog.map(catalogProblem => 
                        <li key={catalogProblem}>
                            <Button variant='text' onClick={() => {
                                problemEditorForm.setValue(nameof<ProblemEditorInputs>('loadPath'), catalogProblem);
                                // Promise that doesn't need to be awaited
                                load();
                                setCatalogOpen(false);
                            }}>
                                {catalogProblem}
                            </Button>
                        </li>
                    )}
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => setCatalogOpen(false)}>Close</Button>
            </Modal.Footer>
        </Modal>
        <Grid container item md={12}>
            {alertState.message &&
                <Alert style={{width: '100%'}} variant={alertState.variant}>{alertState.message}</Alert>
            }
        </Grid>
        <Grid container item md={12} spacing={2}>
            <Grid item md={10}>
                <TextField
                    name="loadPath" 
                    inputRef={register({
                        required: true, 
                    })}
                    label='Problem Path to Load'
                    type='text'
                    fullWidth={true}
                />
            </Grid>
            <Grid item md={2}>
                <Button
                    fullWidth={true}
                    style={{
                        height: '100%'
                    }}
                    variant="outlined"
                    onClick={() => {
                        load();
                        onFormChange();
                    }}
                >
                    Load
                </Button>
            </Grid>
        </Grid>
        <Grid container item md={12} spacing={2}>
            <Grid item md={10}>
                <TextField
                    name="userPath" 
                    inputRef={register({
                        required: true, 
                    })}
                    label='Problem Path to Save'
                    type='text'
                    fullWidth={true}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">{savePathAdornmentText}</InputAdornment>,
                        endAdornment: <InputAdornment position="end">
                            <Button variant='text'
                                tabIndex={0}
                                onClick={copySavePathToClipboard}
                                onKeyPress={copySavePathToClipboard}
                            >
                                <FaCopy /> Copy
                            </Button>
                        </InputAdornment>
                    }}
                />
            </Grid>
            <Grid item md={2}>
                <Button
                    fullWidth={true}
                    style={{
                        height: '100%'
                    }}
                    variant="outlined"
                    onClick={save}
                >
                    Save
                </Button>
            </Grid>
        </Grid>
        <Grid container item md={12} spacing={2}>
            <Grid item md={2}>
                <Button
                    fullWidth={true}
                    style={{
                        height: '100%'
                    }}
                    variant="outlined"
                    onClick={() => setCatalogOpen(true)}
                >
                    Open
                </Button>
            </Grid>
            <Grid item md={2} style={{position: 'relative'}} {...getRootProps()}>
                {isDragActive && (
                    <div style={{
                        position: 'absolute', 
                        width: '100%', 
                        height: '100%', 
                        border: '5px dashed lightblue', 
                        borderRadius: '3px',
                        textAlign: 'center',
                        zIndex: 2,
                        backgroundColor: 'white',
                        opacity: 0.9
                    }} 
                    >
                        <div style={{position: 'relative', margin: '0 auto', top: '15%', fontSize: '1em'}}>
                            Drop your pg file to load!
                            <FaFileUpload style={{position: 'relative', margin: '0 auto', top: '15%', display: 'block', fontSize: '1em'}}/>
                        </div>
                    </div>
                )}
                <Button
                    fullWidth={true}
                    style={{
                        height: '100%'
                    }}
                    variant="outlined"
                >
                    <input {...getInputProps()} />
                    Load PG File
                </Button>
            </Grid>
            <Grid item md={2} style ={{
                marginLeft: 'auto'
            }}>
                <TextField
                    inputRef={register({
                        required: true, 
                    })}
                    name="seedValue"
                    aria-label="Problem Seed"
                    variant='outlined'
                    onClick={(event: any) => event.stopPropagation()}
                    onFocus={(event: any) => event.stopPropagation()}
                    label='Problem Seed'
                    type='number'
                    style={{width:'100%'}}
                    // className='hideNumberSpinners'
                    InputProps={{
                        startAdornment: <InputAdornment position='start'>
                            <Tooltip title='Randomize'>
                                <IconButton
                                    aria-label='reload problem with a random seed'
                                    onClick={(event: any)=>{
                                        event.stopPropagation();
                                        problemEditorForm.setValue(nameof<ProblemEditorInputs>('seedValue'), _.random(0, 999999, false));
                                        cycleFlipped();
                                    }}
                                >
                                    <motion.div animate={{scaleX: flipped}} ><FaDice/></motion.div>
                                </IconButton>
                            </Tooltip>
                        </InputAdornment>,
                    }}
                />
            </Grid>
            <Grid item md={2}>
                <Button
                    fullWidth={true}
                    style={{
                        height: '100%'
                    }}
                    variant="outlined"
                    onClick={render}
                >
                    Render
                </Button>
            </Grid>
        </Grid>
        <Grid container item md={12} spacing={2}>
            <Grid item md={6}>
                <Controller
                    name="problemSource"
                    control={control} 
                    defaultValue={false}
                    render={({ onChange, value }) => (
                        <CodeMirror
                            options={{
                                mode: 'perl',
                                // dark theme
                                // theme: 'material',
                                lineNumbers: true,
                                viewportMargin: Infinity
                            }}
                            // According to the documentation example this is how you handle uncontrolled state
                            // putting this in onchange causes a page crash
                            onBeforeChange={(_editor, _data, value) => {
                                onFormChange();
                                onChange(value);
                            }}
                            // onChange={(editor, data, value) => {
                            // }}
                            value={value}
                        />
                    )}
                />
            </Grid>
            <Grid item md={6}>
                {!_.isNil(previewState.problemSource) &&
                <ProblemIframe
                    previewProblemSource={previewState.problemSource}
                    previewSeed={previewState.seedValue}
                    previewShowHints={previewState.showHints}
                    previewShowSolutions={previewState.showSolutions}
                    problem={dummyProblem}
                />}
            </Grid>
        </Grid>
    </form>);
};
