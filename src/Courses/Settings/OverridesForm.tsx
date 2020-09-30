import { Grid, TextField, Button, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import MomentUtils from '@date-io/moment';
import moment, { Moment } from 'moment';
import { extendQuestion, extendTopic, getQuestion, getQuestions, getTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';
import { NewCourseTopicObj, ProblemObject } from '../CourseInterfaces';

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
    const { register, handleSubmit, watch, errors, control, setValue } = useForm<Inputs>();
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const drawerFontSize = '1.4em';

    // Get Topic Override information
    useEffect(()=>{
        if (!topic || problem !== undefined) return;
        setFormLoading(true);

        (async () => {
            try {
                const res = await getTopic({id: topic.id, userId});
                const topicData = res.data.data;
                // If there are overrides for the selected user, overwrite the default dates in the object.
                // Right now, we expect only one override per topic to be returned.
                if (topicData.studentTopicOverride?.length === 1) {
                    _.assign(topicData, topicData.studentTopicOverride[0]);
                }

                setValue('startDate', moment(topicData.startDate));
                setValue('endDate', moment(topicData.endDate));
                setValue('deadDate', moment(topicData.deadDate));
            } catch (e) {
                console.error(`Topic ${topic.id} or User ${userId} does not exist!`, e);
            } finally {
                setFormLoading(false);
            }
        })();
    }, [topic, userId]);

    // Get Question Override information
    useEffect(()=>{
        if (!problem) return;

        (async () => {
            try {
                const res = await getQuestion({id: problem.id, userId});
                const questionData = res.data.data;
                console.log(questionData);
                // If there are overrides for the selected user, overwrite the default dates in the object.
                // Right now, we expect only one override per topic to be returned.
                if (questionData.studentTopicQuestionOverride?.length === 1) {
                    _.assign(questionData, questionData.studentTopicQuestionOverride[0]);
                }

                setValue('maxAttempts', questionData.maxAttempts);
            } catch (e) {
                console.error(`Question ${problem.id} or User ${userId} does not exist!`, e);
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
        setSubmitLoading(true);
        console.log(extensions);
        if (problem) {
            await updateQuestions(problem.id, userId, extensions as {maxAttempts: number});
        } else if (topic) {
            await updateTopic(topic.id, userId, extensions as {startDate: Moment, endDate: Moment, deadDate: Moment});
        } else {
            console.error('Unhandled override case.');
        }
        setSubmitLoading(false);
    };

    const renderQuestionOverrideForm = (question: ProblemObject) => (
        <Grid item container md={12} alignItems='flex-start' justify="center">
            <Grid item md={4}>
                <TextField inputRef={register} name="maxAttempts" defaultValue={question.maxAttempts} label='Max Attempts' />
            </Grid>
        </Grid>
    );

    const renderTopicOverrideForm = (topic: NewCourseTopicObj) => (
        <>
            <Grid item md={12}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Controller
                        as={<KeyboardDatePicker value="" onChange={() => {}} />}
                        name="startDate"
                        control={control}
                        defaultValue={moment(topic.startDate)}
                        autoOk
                        variant="inline"
                        format="MM/DD/yyyy"
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        fullWidth={true}
                        label='Start Date'
                        InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                        inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                    />
                </MuiPickersUtilsProvider>
            </Grid>

            <Grid item md={12}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Controller
                        as={<KeyboardDatePicker value="" onChange={() => {}} />}
                        name="endDate"
                        control={control}
                        defaultValue={moment(topic.endDate)}
                        autoOk
                        variant="inline"
                        format="MM/DD/yyyy"
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        fullWidth={true}
                        label='End Date'
                        InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                        inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                        // minDate={}
                    />
                </MuiPickersUtilsProvider>
            </Grid>

            <Grid item md={12}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Controller
                        as={<KeyboardDatePicker value="" onChange={() => {}} />}
                        name="deadDate"
                        control={control}
                        defaultValue={moment(topic.deadDate)}
                        autoOk
                        variant="inline"
                        format="MM/DD/yyyy"
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                        fullWidth={true}
                        label='Dead Date'
                        InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                        inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                        // minDate={}
                    />
                </MuiPickersUtilsProvider>
            </Grid>
        </>
    );
  
    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{width: '100%', marginTop: '1.5rem'}}>
            <Grid container justify='center'>
                <Grid container item md={6} spacing={2}>
                    {/* TODO: Use AnimatePresence for a better UX than the flicker or delay. */}
                    {formLoading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            {/* TODO: Ternary with problem overrides */}
                            {problem ? 
                                renderQuestionOverrideForm(problem) :
                                (topic && renderTopicOverrideForm(topic))
                            }
                        </>
                    )
                    }
            
                    <Grid container item md={12} alignItems='flex-start' justify="flex-end" >
                        <Grid item>
                            {submitLoading ? 
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