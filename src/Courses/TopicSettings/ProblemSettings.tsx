import React, { useEffect, useRef, useState } from 'react';
import { Button, Grid, Snackbar } from '@material-ui/core';
import { MultipleProblemPaths, ToggleField, ProblemMaxAttempts, ProblemPath, ProblemWeight, RandomSeedSet } from './GenericFormInputs';
import { Alert as MUIAlert } from '@material-ui/lab';
import { Link } from 'react-router-dom';
import { ProblemObject, TopicObject, TopicTypeId } from '../CourseInterfaces';
import { ProblemSettingsInputs } from './TopicSettingsPage';
import { useForm, FormProvider } from 'react-hook-form';
import { deleteQuestion, putQuestion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';
import { useMUIAlertState } from '../../Hooks/useAlertState';
import { ConfirmationModal } from '../../Components/ConfirmationModal';
import { DevTool } from '@hookform/devtools';

import './TopicSettings.css';
import logger from '../../Utilities/Logger';
import RendererPreview from './RendererPreview';
import { HasEverBeenActiveWarning } from './HasEverBeenActiveWarning';
import { PromptUnsaved } from '../../Components/PromptUnsaved';
import { RegradeTopicButton } from './RegradeTopicButton';

interface ProblemSettingsProps {
    selected: ProblemObject;
    // Used to reset the selected bar after a deletion occurs.
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
    regrade: () => unknown;
    fetchTopic: () => Promise<void>;
}

export const ProblemSettings: React.FC<ProblemSettingsProps> = ({selected, setSelected, setTopic, topic, regrade, fetchTopic}) => {
    const additionalProblemPathsArray = selected.courseQuestionAssessmentInfo?.additionalProblemPaths;
    const additionalProblemPathsArrayIsEmpty = _.isNil(additionalProblemPathsArray) || _.isEmpty(additionalProblemPathsArray);

    const defaultValues : ProblemSettingsInputs = {
        ...selected,
        courseQuestionAssessmentInfo: {
            randomSeedSet: [],
            ...selected.courseQuestionAssessmentInfo,
            additionalProblemPaths: [
                {path: selected.webworkQuestionPath},
                ...additionalProblemPathsArray?.map((s: string) => ({path: s})) || [],
                {path: ''}
            ],
        }
    };

    const formSettings: {mode: 'onSubmit', shouldFocusError: boolean, defaultValues: ProblemSettingsInputs} = {
        mode: 'onSubmit',
        shouldFocusError: true,
        defaultValues: defaultValues
    };

    const topicForm = useForm<ProblemSettingsInputs>(formSettings);

    const { handleSubmit, control, watch, reset, setError, clearErrors, formState } = topicForm;
    const { optional, smaEnabled, webworkQuestionPath } = watch();

    const additionalProblemPaths = watch('courseQuestionAssessmentInfo.additionalProblemPaths', [{path: ''}]);
    const [{ message: updateAlertMsg, severity: updateAlertType }, setUpdateAlert] = useMUIAlertState();
    const noPGErrorObject = useRef([]);
    const [PGErrorsMsg, setPGErrorsAlert] = useState<string[]>(noPGErrorObject.current);
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(()=>{
        const defaultAdditionalProblemPaths = [
            {path: selected.webworkQuestionPath},
            ...additionalProblemPathsArray?.map((s: string) => ({path: s})) || [],
            {path: ''}
        ];

        // Manually override the fields to be in the correct form below.
        const selectedWithoutAssessmentInfo = _.omit(selected, ['courseQuestionAssessmentInfo']);

        reset({
            ...selectedWithoutAssessmentInfo,
            ...(topic.topicTypeId === TopicTypeId.EXAM && {
                courseQuestionAssessmentInfo: {
                    additionalProblemPaths: defaultAdditionalProblemPaths,
                    randomSeedSet: selected.courseQuestionAssessmentInfo?.randomSeedSet || [],
                }
            }
            )
        });

    }, [selected, additionalProblemPathsArray, additionalProblemPathsArrayIsEmpty, reset, setUpdateAlert, topic.topicTypeId]);


    useEffect(()=>{
        (topic.topicTypeId === TopicTypeId.PROBLEM_SET) ?
            setErrorsForProblemSets() :
            setErrorsForAssessments();

    }, [selected, additionalProblemPathsArray, topic.topicTypeId]);

    const setErrorsForProblemSets = () => {
        if (_.isNil(selected.errors) || _.isEmpty(selected.errors)) {
            clearErrors('webworkQuestionPath');
            setPGErrorsAlert(noPGErrorObject.current);
            return;
        }

        setError('webworkQuestionPath', {
            type: 'manual',
            message: 'There was an error with this path.'
        });

        setPGErrorsAlert(_(selected.errors).values().flatten().value());
    };

    const setErrorsForAssessments = () => {
        const paths = (additionalProblemPathsArray === undefined) ? [selected.webworkQuestionPath] : [selected.webworkQuestionPath, ...additionalProblemPathsArray];
        const errors = _.assign({}, selected.errors, selected.courseQuestionAssessmentInfo?.errors);

        if (_.isNil(errors) || _.isEmpty(errors)) {
            clearErrors('courseQuestionAssessmentInfo.additionalProblemPaths');
            setPGErrorsAlert(noPGErrorObject.current);
            return;
        }

        _.forEach(paths, (path, index) => {
            const error = errors[path];
            if (_.isNil(error)) return;

            setError(`courseQuestionAssessmentInfo.additionalProblemPaths[${index}].path`, {
                type: 'manual',
                message: 'There was an error with this path.',
            });
        });

        setPGErrorsAlert(_(errors).values().flatten().value());
    };

    const onSubmit = async (data: ProblemSettingsInputs) => {
        if (_.isNil(selected)) {
            logger.error('Tried to submit while problem was blank!');
            return;
        }

        setSaving(true);

        // React Hook Forms only supports nested field array structures, so we have to flatten it ourselves.
        const fieldArray = _.compact(data.courseQuestionAssessmentInfo?.additionalProblemPaths?.map(f => f.path));
        // The first path should be set to the Webwork Question path.
        const firstPath = fieldArray.shift();
        const updateAssessmentInfo = (data.courseQuestionAssessmentInfo && {
            courseQuestionAssessmentInfo: {
                ...(data.courseQuestionAssessmentInfo.additionalProblemPaths && {additionalProblemPaths: fieldArray}),
                randomSeedSet: data.courseQuestionAssessmentInfo.randomSeedSet,
            }
        });

        if (!_.isNil(firstPath)) {
            data.webworkQuestionPath = firstPath;
        }

        // updateAssessmentInfo has all the fields in the correct format for react-hook-forms
        const dataWithoutAssessmentInfo = _.omit(data, ['courseQuestionAssessmentInfo']);

        try {
            const res = await putQuestion({
                id: selected.id,
                data: {
                    ...dataWithoutAssessmentInfo,
                    ...updateAssessmentInfo
                }
            });

            const dataFromBackend = res.data.data.updatesResult.first;

            // Overwrite fields from the original object. This resets the state object when clicking between options.
            const newTopic = new TopicObject(topic);
            const newQuestion = _.find(newTopic.questions, ['id', selected.id]);

            if (_.isNil(newQuestion)) {
                logger.error(`Problem ${selected.id} was updated, but the API response did not include it in Topic ${topic.id}.`);
                setUpdateAlert({message: 'We were unable to update this question as part of this topic.', severity: 'error'});
                return;
            }
            setUpdateAlert({message: 'Successfully updated', severity: 'success'});

            // TODO: Right now, the backend does not return the courseQuestionAssessmentInfo, so we should use the local data
            // if the attempt was a success.
            _.assign(newQuestion, dataFromBackend, updateAssessmentInfo);
            setTopic(newTopic);
            // This is a hack to avoid having to implement a state management solution right now.
            setSelected(newQuestion);
            fetchTopic();
        } catch (e) {
            logger.error('Error updating question.', e);
            setUpdateAlert({message: e.message, severity: 'error'});
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        setUpdateAlert({message: '', severity: 'warning'});
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
                setSelected(
                    // If problemNumber === the original questions list length, this was the last problem
                    // and should be set to the problem before it. (problemNumber-1, with an additional -1 for the index.)
                    problemNumber === topic.questions.length ?
                        newTopic.questions[problemNumber - 2] :
                        // [problemNumber - 1] is the current problemNumber.
                        newTopic.questions[problemNumber - 1]
                );
            }

            setUpdateAlert({message: 'Successfully deleted question', severity: 'success'});
        } catch (e) {
            setUpdateAlert({message: e.message, severity: 'error'});
        }
    };

    return (
        <FormProvider {...topicForm}>
            <HasEverBeenActiveWarning topic={topic} />
            <PromptUnsaved message='You have unsaved changes. Are you sure you want to leave the page?' when={formState.isDirty} />
            <form onChange={() => {if (updateAlertMsg !== '') setUpdateAlert({message: '', severity: 'warning'});}} onSubmit={handleSubmit(onSubmit)}>
                <DevTool control={control} />
                <Grid container item md={12} spacing={3}>
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        open={updateAlertMsg !== ''}
                        autoHideDuration={updateAlertType === 'success' ? 6000 : undefined}
                        onClose={() => setUpdateAlert(alertState => ({...alertState, message: ''}))}
                        style={{maxWidth: '50vw'}}
                    >
                        <MUIAlert
                            onClose={() => setUpdateAlert(alertState => ({...alertState, message: ''}))}
                            severity={updateAlertType}
                            variant='filled'
                            style={{fontSize: '1.1em'}}
                        >
                            <div>{updateAlertMsg}</div>
                        </MUIAlert>
                    </Snackbar>
                    <Grid container item md={12} spacing={3}>
                        <Grid item container md={12}><h1>Problem Settings</h1></Grid>
                        <Grid item container md={12}>
                            {PGErrorsMsg.length > 0 && <MUIAlert 
                                severity='error'
                                variant='standard'
                            >
                                {PGErrorsMsg.map((msg, i) => {
                                    return (i !== PGErrorsMsg.length - 1 && i > 0) ? <>{msg}<br/></> : msg;
                                })}
                            </MUIAlert>}
                        </Grid>
                        <Grid item md={8}>
                            Enter the path to the problem on the Rederly server. This is prefaced either
                            with <code>Library/</code> or <code>Contrib/</code> if the desired problem is included
                            in the <Link to='https://github.com/openwebwork/webwork-open-problem-library'>OPL</Link> or <code>private/</code> if
                            this problem has been uploaded to your private Rederly folder.
                            {topic.topicTypeId === TopicTypeId.EXAM ?
                                <MultipleProblemPaths /> :
                                <ProblemPath />
                            }
                        </Grid>{topic.topicTypeId !== TopicTypeId.EXAM && (<Grid item md={12}>
                            Enter the maximum number of graded attempts for a problem, use 0 or -1 to give students unlimited attempts.<br/>
                            <ProblemMaxAttempts />
                        </Grid>)}<Grid item md={12}>
                            Enter the number of points available for this problem. If the problem is marked as <b>optional</b>, these points will be treated as extra credit.<br/>
                            <ProblemWeight />
                        </Grid>
                        {topic.topicTypeId === TopicTypeId.PROBLEM_SET &&
                        <Grid item md={12}>
                            This problem is {optional ? 'optional' : 'required'}.<br/>
                            <ToggleField name={'optional'} label={'Optional'} /><br />
                            Show Me Another <br />
                            <ToggleField name={'smaEnabled'} label={(smaEnabled) ? 'Enabled' : 'Disabled'} /><br />
                        </Grid>
                        }
                        {topic.topicTypeId === TopicTypeId.EXAM && (
                            <Grid item md={12}>
                                <Grid item md={10}>
                                    You can optionally limit the randomization of this problem by entering specific <b>random seeds</b> (numeric values between 1 and 999999) into the text field below.
                                    Use the problem preview pane below to see how different <b>seeds</b> affect the randomization. You can add multiple numbers by pressing enter or using a comma to separate them.<br/>
                                </Grid>
                                <RandomSeedSet />
                            </Grid>
                        )}
                    </Grid><Grid item xs={12}>
                        <RendererPreview
                            opened={false}
                            defaultPath={topic.topicTypeId === TopicTypeId.EXAM ?
                                additionalProblemPaths.first?.path || '' :
                                webworkQuestionPath}
                        />
                    </Grid>
                    <Grid container item md={12} alignItems='flex-start' justify="flex-end" >
                        <RegradeTopicButton
                            topic={topic}
                            saving={saving}
                            style={{
                                marginRight: '1em',
                            }}
                            setTopic={setTopic}
                            onRegradeClick={regrade}
                            question={selected}
                            fetchTopic={fetchTopic}
                            // onRegradeClick={() => setConfirmationParameters(current => ({
                            //     ...current,
                            //     show: true
                            // }))}
                        />
                        <Button
                            color='secondary'
                            variant='contained'
                            onClick={()=>{setShowConfirmDelete(true);}}
                            style={{marginRight: '1em'}}
                            disabled={saving || topic.retroStartedTime !== null}
                        >
                            Delete
                        </Button>
                        <Button
                            color='primary'
                            variant='contained'
                            type='submit'
                            disabled={saving || topic.retroStartedTime !== null}
                        >
                            Save Problem
                        </Button>
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