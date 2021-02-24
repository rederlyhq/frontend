import { Accordion, AccordionSummary, AccordionDetails, Grid, TextField, InputAdornment, IconButton, Tooltip, Button, Select, MenuItem } from '@material-ui/core';
import { ExpandMore, Refresh } from '@material-ui/icons';
import { motion, useAnimation, useCycle } from 'framer-motion';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { FaDice, FaFile } from 'react-icons/fa';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { ProblemObject } from '../CourseInterfaces';
import * as qs from 'querystring';
import { Constants } from '../../Utilities/Constants';
import { Autocomplete } from '@material-ui/lab';

interface RendererPreviewProps {
    defaultPath?: string;
    dropdownPaths?: string[];
    opened?: boolean;
}

export const RendererPreview: React.FC<RendererPreviewProps> = ({defaultPath, dropdownPaths}) => {
    const navigateToEditor = (problemPath: string) => {
        // We use useRouteMatch().path elsewhere but that didn't give desired results
        // TODO is this safe if it is hosted under an endpoints and not at root
        window.open(`/common/editor?${qs.stringify({
            loadPath: problemPath.toBase64()
        })}`, '_blank');
    };
    const [previewSettings, setPreviewSettings] = useState({path: '', seed: 1});
    const [forcedUpdate, setForcedUpdate] = React.useState(new ProblemObject());
    const forceUpdate = React.useCallback(() => setForcedUpdate(new ProblemObject()), []);
    const controls = useAnimation();
    const [flipped, cycleFlipped] = useCycle(-1, 1);

    useEffect(()=>{
        if (!_.isNil(defaultPath)) {
            setPreviewSettings(settings => ({...settings, path: defaultPath}));
            forceUpdate();
        }
    }, [defaultPath, forceUpdate]);

    return (
        <Accordion TransitionProps={{ mountOnEnter: true, unmountOnExit: true }} elevation={5} defaultExpanded={true} expanded={dropdownPaths ? true : undefined}>
            <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-label="Expand"
                aria-controls="rendered-problem-preview"
                id="rendered-problem-preview"
            >
                Problem Preview Pane
            </AccordionSummary>
            <AccordionDetails>
                <Grid container xs={12}>
                    <Grid item xs={10}>
                        {true && <Autocomplete
                            id="combo-box-demo"
                            options={dropdownPaths ?? []}
                            getOptionLabel={(option) => option.replace(/(my|our)\/([a-zA-Z0-9-]{4})[a-zA-Z0-9-]*\//g, '$1/$2.../')}
                            selectOnFocus
                            style={{ width: '100%' }}
                            key={dropdownPaths?.first}
                            defaultValue={dropdownPaths?.first}
                            renderInput={(params) => (
                                <TextField {...params} label="Combo box" variant="outlined"
                                    inputProps={{
                                        ...params.inputProps,
                                        onCopy: (event) => {
                                            event.preventDefault();
                                            console.log('Setting ', previewSettings.path);
                                            event.clipboardData.setData('text/plain', previewSettings.path);
                                        }
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: <>
                                            {params.InputProps.endAdornment}
                                            <InputAdornment position="end">
                                                <Button variant='text'
                                                    tabIndex={0}
                                                    onClick={() => navigateToEditor(previewSettings.path)}
                                                    onKeyPress={() => navigateToEditor(previewSettings.path)}
                                                >
                                                    <FaFile /> Edit
                                                </Button>
                                            </InputAdornment>
                                        </>
                                    }}
                                />
                            )}
                        />}
                        {false && <Select
                            variant='outlined'
                            value={previewSettings.path}
                            onChange={(e) => setPreviewSettings(settings => ({...settings, path: e.target.value as string}))}
                            displayEmpty
                            // className={classes.selectEmpty}
                            inputProps={{ 'aria-label': 'Without label',
                            }}
                            style={{width: '100%'}}
                        >
                            <MenuItem value="" disabled>
                                Placeholder
                            </MenuItem>
                            {dropdownPaths?.map(path => <MenuItem key={path} value={path}>{path}</MenuItem>)}
                        </Select>}
                        {false && <TextField
                            fullWidth
                            aria-label='Problem Path'
                            variant='outlined'
                            onClick={(event: any) => event.stopPropagation()}
                            onFocus={(event: any) => event.stopPropagation()}
                            onChange={(event: any)=>{
                                const val = event.target.value;
                                setPreviewSettings(settings => ({...settings, path: val}));
                            }}
                            onKeyDown={(e: any) => {
                                if (e.key === 'Enter') {
                                    forceUpdate();
                                }
                            }}
                            onBlur={()=>{
                                // Validate first
                                // const regex = Constants.Renderer.VALID_PROBLEM_PATH_REGEX;
                                // if (regex.test(previewSettings.path)) {
                                forceUpdate();
                                // }
                            }}
                            label='Problem Path'
                            value={previewSettings.path}
                            inputProps={{
                                form: 'null',
                                pattern: Constants.Renderer.VALID_PROBLEM_PATH_REGEX
                            }}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <Button variant='text'
                                        tabIndex={0}
                                        onClick={() => navigateToEditor(previewSettings.path)}
                                        onKeyPress={() => navigateToEditor(previewSettings.path)}
                                    >
                                        <FaFile /> Edit
                                    </Button>
                                </InputAdornment>
                            }}
                        />}
                    </Grid>
                    <Grid item xs={2}>
                        <TextField
                            aria-label="Problem Seed"
                            variant='outlined'
                            onClick={(event: any) => event.stopPropagation()}
                            onFocus={(event: any) => event.stopPropagation()}
                            onChange={(event: any)=>{
                                const val = event.target.value;
                                if (_.isNaN(parseInt(val, 10))) {
                                    return;
                                }
                                setPreviewSettings(settings => ({...settings, seed: val}));
                            }}
                            onKeyDown={(e: any) => {
                                if (e.key === 'Enter') {
                                    forceUpdate();
                                }
                            }}
                            label='Problem Seed'
                            value={previewSettings.seed}
                            type='number'
                            className='hideNumberSpinners'
                            InputProps={{
                                startAdornment: <InputAdornment position='start'>
                                    <Tooltip title='Randomize'>
                                        <IconButton
                                            aria-label='reload problem with a random seed'
                                            onClick={(event: any)=>{
                                                event.stopPropagation();
                                                setPreviewSettings(settings => ({...settings, seed: _.random(0, 999999, false)}));
                                                forceUpdate();
                                                cycleFlipped();
                                            }}
                                        >
                                            <motion.div animate={{scaleX: flipped}} ><FaDice/></motion.div>
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>,
                                endAdornment: <InputAdornment position='end'>
                                    <Tooltip title='Reload'>
                                        <IconButton
                                            aria-label='reload problem with current seed'
                                            onClick={(event: any)=>{
                                                event.stopPropagation();
                                                controls.start({rotate: 360, transition: {duration: 0.5}});
                                                forceUpdate();
                                            }}
                                        >
                                            <motion.div animate={controls}><Refresh /></motion.div>
                                        </IconButton>
                                    </Tooltip>
                                </InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid xs={12} item>
                        {Constants.Renderer.VALID_PROBLEM_PATH_REGEX.test(previewSettings.path) ?
                            <ProblemIframe 
                                problem={forcedUpdate} 
                                previewPath={previewSettings.path}
                                previewSeed={previewSettings.seed}
                                setProblemStudentGrade={() => {}}
                                readonly={false} /> :
                            <>
                                {previewSettings.path !== '' && (
                                    <Alert variant='warning'>The path you&apos;ve entered is invalid.</Alert>
                                )}
                            </>                             
                        }
                    </Grid>                    
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

export default RendererPreview;