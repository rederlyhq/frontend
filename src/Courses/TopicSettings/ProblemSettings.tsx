import React, { useEffect, useState } from 'react';
import { Button, Grid, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, ExpansionPanelActions, TextField, IconButton, InputAdornment, Tooltip } from '@material-ui/core';
import { ExpandMore, Refresh } from '@material-ui/icons';
import { MultipleProblemPaths, OptionalField, ProblemMaxAttempts, ProblemPath, ProblemWeight, RandomSeedSet } from './GenericFormInputs';
import { Link } from 'react-router-dom';
import { ProblemObject, TopicObject, TopicTypeId } from '../CourseInterfaces';
import { ProblemSettingsInputs } from './TopicSettingsPage';
import { useForm, FormProvider } from 'react-hook-form';
import { deleteQuestion, putQuestion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';
import useAlertState from '../../Hooks/useAlertState';
import { Alert } from 'react-bootstrap';
import { ConfirmationModal } from '../../Components/ConfirmationModal';
import { DevTool } from '@hookform/devtools';
import ProblemIframe from '../../Assignments/ProblemIframe';

import './TopicSettings.css';
import { FaDice } from 'react-icons/fa';
import { motion, useAnimation, useCycle } from 'framer-motion';
import { IconBaseProps } from 'react-icons/lib';

interface ProblemSettingsProps {
    selected: ProblemObject;
    // Used to reset the selected bar after a deletion occurs.
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
}

export const ProblemSettings: React.FC<ProblemSettingsProps> = ({selected, setSelected, setTopic, topic}) => {
    const additionalProblemPathsArray = selected.courseQuestionAssessmentInfo?.additionalProblemPaths;
    const additionalProblemPathsArrayIsEmpty = _.isNil(additionalProblemPathsArray) || _.isEmpty(additionalProblemPathsArray);

    const defaultValues : ProblemSettingsInputs = {
        ...selected,
        courseQuestionAssessmentInfo: {
            ...selected.courseQuestionAssessmentInfo,
            ...(
                additionalProblemPathsArrayIsEmpty ?
                    {
                        additionalProblemPaths: [{path: ''}]
                    } : 
                    {
                        additionalProblemPaths: additionalProblemPathsArray.map((s: string) => ({path: s})),
                    }
            ),
        }
    };

    const formSettings: {mode: 'onSubmit', shouldFocusError: boolean, defaultValues: ProblemSettingsInputs} = {
        mode: 'onSubmit', 
        shouldFocusError: true,
        defaultValues: defaultValues
    };

    const topicForm = useForm<ProblemSettingsInputs>(formSettings);

    const { handleSubmit, control, watch, reset } = topicForm;
    const { optional } = watch();
    const [{ message: updateAlertMsg, variant: updateAlertType }, setUpdateAlert] = useAlertState();
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
    const [previewSettings, setPreviewSettings] = useState({path: '', seed: 1});
    const [forcedUpdate, setForcedUpdate] = React.useState(new ProblemObject());
    const forceUpdate = React.useCallback(() => setForcedUpdate(new ProblemObject()), []);
    const pgRegex = /^(Library|Contrib|webwork-open-problem-library|private\/our|private\/templates|private\/rederly).*\.pg$/;

    const pathArray = watch('courseQuestionAssessmentInfo');

    useEffect(()=>{
        let defaultAdditionalProblemPaths = [{path: ''}];
        // Force renders to always include one empty path at the end.
        if (!additionalProblemPathsArrayIsEmpty) {
            const additionalProblemPathsArrayWithPadding = additionalProblemPathsArray.map((s: string) => ({path: s}));
            defaultAdditionalProblemPaths = [...additionalProblemPathsArrayWithPadding, {path: ''}];
        }
        reset({
            ...selected,
            ...(topic.topicTypeId === TopicTypeId.EXAM && {
                courseQuestionAssessmentInfo: {
                    additionalProblemPaths: defaultAdditionalProblemPaths,
                    randomSeedSet: selected.courseQuestionAssessmentInfo?.randomSeedSet || [],
                }
            }
            )
        });
        setUpdateAlert({message: '', variant: 'warning'});
    }, [selected]);

    const onSubmit = async (data: ProblemSettingsInputs) => {
        if (_.isNil(selected)) {
            console.error('Tried to submit while problem was blank!');
            return;
        }

        // React Hook Forms only supports nested field array structures, so we have to flatten it ourselves.
        const fieldArray = data.courseQuestionAssessmentInfo?.additionalProblemPaths?.map?.(f => f.path);

        try {
            const res = await putQuestion({
                id: selected.id,
                data: {
                    ...data,
                    ...(data.courseQuestionAssessmentInfo && {
                        courseQuestionAssessmentInfo: {
                            ...(data.courseQuestionAssessmentInfo.additionalProblemPaths && {additionalProblemPaths: _.compact(fieldArray)}),
                            randomSeedSet: data.courseQuestionAssessmentInfo.randomSeedSet,
                        }
                    })
                }
            });

            const dataFromBackend = res.data.data.updatesResult?.[0];
            setUpdateAlert({message: 'Successfully updated', variant: 'success'});

            // Overwrite fields from the original object. This resets the state object when clicking between options.
            const newTopic = new TopicObject(topic);
            const newQuestion = _.find(newTopic.questions, ['id', selected.id]);

            _.assign(newQuestion, dataFromBackend);
            setTopic(newTopic);
        } catch (e) {
            console.error('Error updating topic.', e);
            setUpdateAlert({message: e.message, variant: 'danger'});
        }
    };

    const onDelete = async () => {
        setUpdateAlert({message: '', variant: 'warning'});
        try {
            const problemId = selected.id;
            const problemNumber = selected.problemNumber;
            await deleteQuestion({
                id: problemId
            });    
            let newProblems = [...topic.questions];
            const deletedProblem = _.find(newProblems, ['id', problemId]);
            // Decrement everything after
            if (!_.isNil(deletedProblem)) {
                _.filter(newProblems, problem => problem.problemNumber > deletedProblem.problemNumber).forEach(problem => problem.problemNumber--);
            }
            newProblems = _.reject(newProblems, ['id', problemId]);
            const newTopic = new TopicObject(topic);
            newTopic.questions = newProblems;
            setTopic(newTopic);
            // If the problem we deleted was the last one, reset back to topic.
            if (newProblems.length === 0) {
                setSelected(newTopic);
            } else {
                setSelected(problemNumber < newTopic.questions.length ? newTopic.questions[problemNumber - 1] : newTopic.questions[problemNumber - 2]);
            }

            setUpdateAlert({message: 'Successfully deleted question', variant: 'success'});
        } catch (e) {
            setUpdateAlert({message: e.message, variant: 'danger'});
        }
    };

    const controls = useAnimation();
    const [flipped, cycleFlipped] = useCycle(-1, 1);

    const rendererPreview = () => {
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMore />}
                    aria-label="Expand"
                    aria-controls="additional-actions3-content"
                    id="additional-actions3-header"
                >
                    Problem Preview Pane
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Grid container xs={12}>
                        <Grid item xs={10}>
                            <TextField
                                fullWidth
                                aria-label='Problem Path'
                                variant='outlined'
                                onClick={(event: any) => event.stopPropagation()}
                                onFocus={(event: any) => event.stopPropagation()}
                                onChange={(event: any)=>{
                                    const val = event.target.value;
                                    setPreviewSettings(settings => ({...settings, path: val}));
                                }}
                                onBlur={()=>{
                                    // Validate first
                                    // const regex = /^(Library|Contrib|webwork-open-problem-library|private\/our|private\/templates|private\/rederly).*\.pg$/;
                                    // if (regex.test(previewSettings.path)) {
                                        forceUpdate();
                                    // }
                                }}
                                label='Problem Path'
                                value={previewSettings.path}
                                inputProps={{
                                    pattern: /^(Library|Contrib|webwork-open-problem-library|private\/our|private\/templates|private\/rederly).*\.pg$/
                                }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            {!_.isEmpty(pathArray?.additionalProblemPaths) && pathArray?.additionalProblemPaths?.[0].path}
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
                            {pgRegex.test(previewSettings.path) ?
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
                </ExpansionPanelDetails>
                    
            </ExpansionPanel>
        );
    };

    return (
        <FormProvider {...topicForm}>
            <form onChange={() => {if (updateAlertMsg !== '') setUpdateAlert({message: '', variant: 'warning'});}} onSubmit={handleSubmit(onSubmit)}>
                <DevTool control={control} />
                <Grid container item md={12} spacing={3}>
                    {(updateAlertMsg !== '') && <Grid md={12} item><Alert variant={updateAlertType}>{updateAlertMsg}</Alert></Grid>}
                    <Grid container item md={12} spacing={3}>
                        <Grid item container md={12}><h1>Problem Settings</h1></Grid>
                        <Grid item md={8}>
                            Enter the path to the problem on the Rederly server. This is prefaced either 
                            with <code>Library/</code> or <code>Contrib/</code> if this problem is included 
                            in the <Link to='https://github.com/openwebwork/webwork-open-problem-library'>OPL</Link> or <code>private/</code> if 
                            this problem has been uploaded to your private Rederly folder.
                            {topic.topicTypeId === TopicTypeId.EXAM ? 
                                <MultipleProblemPaths /> :
                                <ProblemPath />
                            }
                        </Grid><Grid item md={12}>
                            Enter the max attempts for a problem, or 0 or -1 for unlimited attempts.<br/>
                            <ProblemMaxAttempts />
                        </Grid><Grid item md={12}>
                            Enter the grading weight for this problem. Optional problems with weights will be treated as extra credit.<br/>
                            <ProblemWeight />
                        </Grid><Grid item md={12}>
                            This problem is {optional ? 'optional' : 'required'}.<br/>
                            <OptionalField />
                        </Grid>
                        {topic.topicTypeId === TopicTypeId.EXAM && (
                            <Grid item md={12}>
                                You can optionally limit the seed values used for specific problems.<br/>
                                <RandomSeedSet />
                            </Grid>
                        )}
                    </Grid><Grid item xs={12}>
                        {
                            rendererPreview()
                        }
                    </Grid>
                    <Grid container item md={12} alignItems='flex-start' justify="flex-end" >
                        <Grid container item md={4} spacing={3} justify='flex-end'>
                            <Button
                                color='secondary'
                                variant='contained'
                                onClick={()=>{setShowConfirmDelete(true);}}
                                style={{marginRight: '1em'}}
                            >
                                Delete
                            </Button>
                            <Button
                                color='primary'
                                variant='contained'
                                type='submit'
                            >
                                Save Problem
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <ConfirmationModal
                    onConfirm={() => { onDelete(); setShowConfirmDelete(false); }}
                    onHide={() => {
                        setShowConfirmDelete(false);
                    }}
                    show={showConfirmDelete}
                    headerContent={<h5>Confirm delete</h5>}
                    bodyContent={`Are you sure you want to remove Problem ${selected.problemNumber}?`}
                />
            </form>
        </FormProvider>
    );
};

export default ProblemSettings;