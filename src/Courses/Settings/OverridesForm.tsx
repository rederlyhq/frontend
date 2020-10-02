import { Grid, TextField, Button, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import MomentUtils from '@date-io/moment';
import moment, { Moment } from 'moment';
import { extendQuestion, extendTopic, getQuestion, getQuestions, getTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';
import { NewCourseTopicObj, ProblemObject } from '../CourseInterfaces';
import { Alert } from 'react-bootstrap';

type Inputs = {
    startDate: Moment;
    endDate: Moment;
    deadDate: Moment;
};

interface OverridesFormProps {
    userId: number;
    topic?: NewCourseTopicObj;
    problem?: ProblemObject;
}

export const OverridesForm: React.FC<OverridesFormProps> = ({topic, userId, problem}) => {
    const { register, handleSubmit, getValues, errors, control, setValue, watch, formState, reset } = useForm<Inputs>({mode: 'onSubmit', shouldFocusError: true });
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string>('');
    const drawerFontSize = '1.4em';
    const { startDate, endDate, deadDate } = watch();
    const [defaultTopic, setDefaultTopic] = useState<NewCourseTopicObj | undefined>(topic);
    const [defaultProblem, setDefaultProblem] = useState<ProblemObject | undefined>(problem);
    // TODO: This should be provided by react-hook-forms
    const [ isSubmitSuccessful, setIsSubmitSuccesful] = useState<boolean>(false);
    const { /* isSubmitSuccessful,*/ isSubmitting  } = formState;

    useEffect(()=>{
        setDefaultTopic(topic);
        setDefaultProblem(problem);
        setIsSubmitSuccesful(false);
        reset();
    }, [topic, problem, userId]);

    // Get Topic Override information
    useEffect(()=>{
        if (!topic || problem !== undefined) return;
        setFormLoading(true);
        setSubmitError('');

        (async () => {
            try {
                const res = await getTopic({id: topic.id, userId});
                const topicData = res.data.data;
                // If there are overrides for the selected user, overwrite the default dates in the object.
                // Right now, we expect only one override per topic to be returned.
                if (topicData.studentTopicOverride?.length === 1) {
                    _.assign(topicData, topicData.studentTopicOverride[0]);
                }

                setDefaultTopic(new NewCourseTopicObj(topicData));
            } catch (e) {
                console.error(`Topic ${topic.id} or User ${userId} does not exist!`, e);
                setSubmitError(e.message);
            } finally {
                setFormLoading(false);
            }
        })();
    }, [topic, userId]);

    // Get Question Override information
    useEffect(()=>{
        if (!problem) return;
        setSubmitError('');

        (async () => {
            try {
                const res = await getQuestion({id: problem.id, userId});
                const questionData = res.data.data;

                // If there are overrides for the selected user, overwrite the default dates in the object.
                // Right now, we expect only one override per topic to be returned.
                if (questionData.studentTopicQuestionOverride?.length === 1) {
                    _.assign(questionData, questionData.studentTopicQuestionOverride[0]);
                }

                setDefaultProblem(new ProblemObject(questionData));
            } catch (e) {
                console.error(`Question ${problem.id} or User ${userId} does not exist!`, e);
                setSubmitError(e.data);
            } finally {
                setFormLoading(false);
            }
        })();

    }, [problem, userId]);

    const updateTopic = async (courseTopicContentId: number, userId: number, extensions: {startDate: Moment, endDate: Moment, deadDate: Moment}) => {
        try {
            const res = await extendTopic({courseTopicContentId, userId, extensions});
            console.log(res);
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const updateQuestions = async (courseTopicQuestionId: number, userId: number, extensions: {maxAttempts: number}) => {
        try {
            const res = await extendQuestion({courseTopicQuestionId, userId, extensions});
            console.log(res);
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const onSubmit = async (extensions: {startDate: Moment, endDate: Moment, deadDate: Moment} | {maxAttempts: number}) => {
        setSubmitError('');
        setIsSubmitSuccesful(false);
        try {
            if (problem) {
                await updateQuestions(problem.id, userId, extensions as {maxAttempts: number});
            } else if (topic) {
                await updateTopic(topic.id, userId, extensions as {startDate: Moment, endDate: Moment, deadDate: Moment});
            } else {
                console.error('Unhandled override case.');
            }
            setIsSubmitSuccesful(true);
        } catch (e) {
            setSubmitError(e);
        }
    };

    const renderQuestionOverrideForm = (question: ProblemObject) => (
        <Grid item container md={12} alignItems='flex-start' justify="center">
            <Grid item md={4}>
                <TextField 
                    name="maxAttempts" 
                    inputRef={register({
                        required: true, 
                        min: -1
                    })}
                    defaultValue={question.maxAttempts} 
                    label='Max Attempts'
                    type='number'
                />
            </Grid>
        </Grid>
    );

    const renderTopicOverrideForm = (topic: NewCourseTopicObj) => (
        <>
            <Grid item md={12}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name="startDate"
                        control={control}
                        defaultValue={moment(topic.startDate)}
                        autoOk
                        variant="inline"
                        fullWidth={true}
                        label='Start Date'
                        InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                        inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                        maxDate={endDate || moment(topic.endDate)}
                        rules={{
                            required: true,
                            validate: {
                                isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                                isEarliest: (startDate: Moment) => {
                                    const { endDate, deadDate } = getValues();
                                    return startDate.isSameOrBefore(endDate) && startDate.isSameOrBefore(deadDate) || 'Start date cannot be after End or Dead dates';
                                }
                            }
                        }}
                    />
                </MuiPickersUtilsProvider>
            </Grid>

            <Grid item md={12}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name="endDate"
                        control={control}
                        defaultValue={moment(topic.endDate)}
                        autoOk
                        variant="inline"
                        fullWidth={true}
                        label='End Date'
                        InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                        inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                        minDate={startDate || moment(topic.startDate)}
                        maxDate={deadDate || moment(topic.deadDate)}
                        rules={{
                            required: true,
                            validate: {
                                isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                            }
                        }}
                    />
                </MuiPickersUtilsProvider>
            </Grid>

            <Grid item md={12}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name="deadDate"
                        control={control}
                        defaultValue={moment(topic.deadDate)}
                        autoOk
                        variant="inline"
                        fullWidth={true}
                        label='Dead Date'
                        InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                        inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                        minDate={endDate || moment(topic.endDate)}
                    />
                </MuiPickersUtilsProvider>
            </Grid>
        </>
    );
  
    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{width: '100%', marginTop: '1.5rem'}}>
            <Grid container justify='center'>
                <Grid container item md={6} spacing={2}>
                    <Grid item md={12}>
                        {isSubmitSuccessful && (submitError ? 
                            <Alert variant='danger'>{submitError}</Alert> : 
                            <Alert variant='success'>Successfully updated</Alert>)}
                        {_.values(errors).map(data => <Alert variant='danger' key={(data as any)?.type}>{(data as any)?.message || 'Please enter an appropriate value'}</Alert>)}
                    </Grid>

                    {/* TODO: Use AnimatePresence for a better UX than the flicker or delay. */}
                    {formLoading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            {defaultProblem ? 
                                renderQuestionOverrideForm(defaultProblem) :
                                (defaultTopic && renderTopicOverrideForm(defaultTopic))
                            }
                        </>
                    )
                    }
            
                    <Grid container item md={12} alignItems='flex-start' justify="flex-end" >
                        <Grid item>
                            {isSubmitting ? 
                                (<Button 
                                    variant="contained" 
                                    color='secondary'
                                    style={{fontSize: '1.2em'}}
                                    disabled={true}
                                >
                                    Submitting...
                                </Button>) :
                                (<Button 
                                    variant="contained" 
                                    color='primary' 
                                    type="submit" 
                                    style={{fontSize: '1.2em'}}
                                    disabled={formLoading}
                                >
                                    Confirm Extension
                                </Button>)
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </form>
    );
};

export default OverridesForm;