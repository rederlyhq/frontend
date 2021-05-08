import { Grid, Button, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import moment, { Moment } from 'moment';
import { extendQuestion, extendTopic, getQuestion, getTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';
import { TopicObject, ProblemObject, TopicTypeId } from '../CourseInterfaces';
import { Alert } from 'react-bootstrap';
import logger from '../../Utilities/Logger';
import { TopicOverrideForm } from './TopicOverrideForm';
import { QuestionOverrideForm } from './QuestionOverrideForm';
import { WrappedRegradeTopicButton } from './WrappedRegradeTopicButton';

interface ExtensionsFormProps {
    userId: number;
    topic?: TopicObject;
    problem?: ProblemObject;
}

type TopicExtensions = {
    startDate: Moment;
    endDate: Moment;
    deadDate?: Moment;
    maxGradedAttemptsPerVersion?: number;
    maxVersions?: number;
    versionDelay?: number;
    duration?: number;
}

type QuestionExtensions = {
    maxAttempts: number;
}

type Inputs = TopicExtensions & QuestionExtensions;


export const ExtensionsForm: React.FC<ExtensionsFormProps> = ({topic, userId, problem}) => {
    const formDefaultValues = {
        startDate: moment(),
        endDate: moment(),
        deadDate: moment(),
        maxAttempts: -1,
    };
    const formMethods = useForm<Inputs>(
        {
            mode: 'onSubmit',
            shouldFocusError: true,
            defaultValues: formDefaultValues
        }
    );
    const { handleSubmit, errors, formState, reset, setError, clearErrors } = formMethods;
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [defaultTopic, setDefaultTopic] = useState<TopicObject | undefined>(topic);
    const [defaultProblem, setDefaultProblem] = useState<ProblemObject | undefined>(problem);
    const { isSubmitSuccessful, isSubmitting  } = formState;
    const [refetchTopicTriggerForRegrade, setRefetchTopicTriggerForRegrade] = useState<number | undefined>(undefined);

    useEffect(()=>{
        setDefaultTopic(topic);
        setDefaultProblem(problem);
        reset();
    }, [topic, problem, userId]);

    // Get Topic Override information
    useEffect(()=>{
        if (!topic || problem !== undefined) return;
        setFormLoading(true);

        (async () => {
            try {
                const res = await getTopic({id: topic.id, userId});
                const topicData = res.data.data;

                const newTopic = new TopicObject(topicData);

                const studentTopicOverrides = newTopic.studentTopicOverride;
                if (!_.isNil(studentTopicOverrides) && studentTopicOverrides.length > 0) {
                    if (studentTopicOverrides.length > 1) {
                        // TODO switch to logger
                        // eslint-disable-next-line no-console
                        logger.warn('There are multiple student topic overrides');
                    }
                    const [ studentTopicOverride ] = studentTopicOverrides;
                    const overrides = _.pick(studentTopicOverride, ['startDate', 'endDate', 'deadDate', 'maxAttempts']);
                    _.assign(newTopic, overrides);
                }


                // If there are overrides for the selected user, overwrite the default dates in the object.
                // Right now, we expect only one override per topic to be returned.
                if (topicData.studentTopicOverride?.length === 1) {
                    _.assign(topicData, topicData.studentTopicOverride[0]);
                }

                const studentTopicAssessmentOverrides = newTopic.topicAssessmentInfo?.studentTopicAssessmentOverride;
                if (!_.isNil(studentTopicAssessmentOverrides) && studentTopicAssessmentOverrides.length > 0) {
                    if (studentTopicAssessmentOverrides.length > 1) {
                        // TODO switch to logger
                        // eslint-disable-next-line no-console
                        logger.warn('There are multiple student topic assessment overrides');
                    }
                    const [ studentTopicAssessmentOverride ] = studentTopicAssessmentOverrides;
                    // TODO delete when the backend is fixed for truncation
                    if (!_.isNil((studentTopicAssessmentOverride as any).maxGradedAtt)) {
                        (studentTopicAssessmentOverride as any).maxGradedAttemptsPerVersion = (studentTopicAssessmentOverride as any).maxGradedAtt;
                        delete (studentTopicAssessmentOverride as any).maxGradedAtt;
                    }
                    const overrides = _.pick(studentTopicAssessmentOverride, ['duration', 'maxGradedAttemptsPerVersion', 'maxVersions', 'versionDelay']);
                    _.assign(newTopic.topicAssessmentInfo, overrides);
                }

                reset({
                    startDate: topicData.startDate?.toMoment(),
                    endDate: topicData.endDate?.toMoment(),
                    deadDate: topicData.deadDate?.toMoment(),
                });

                setDefaultTopic(new TopicObject(topicData));
            } catch (e) {
                logger.error(`Topic ${topic.id} or User ${userId} does not exist!`, e);
                setError('server', {
                    type: 'manual',
                    message: e.message,
                });
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

                // If there are overrides for the selected user, overwrite the default dates in the object.
                // Right now, we expect only one override per topic to be returned.
                if (questionData.studentTopicQuestionOverride?.length === 1) {
                    _.assign(questionData, questionData.studentTopicQuestionOverride[0]);
                }

                reset({
                    maxAttempts: questionData.maxAttempts
                });
                setDefaultProblem(new ProblemObject(questionData));
            } catch (e) {
                logger.error(`Question ${problem.id} or User ${userId} does not exist!`, e);
                setError('server', {
                    type: 'manual',
                    message: e.message,
                });
            } finally {
                setFormLoading(false);
            }
        })();

    }, [problem, userId]);

    const updateTopic = async (courseTopicContentId: number, userId: number, inputs: TopicExtensions, topicAssessmentInfoId?: number) => {
        // TODO update state with response, there is currently a bug where coming back from a problem will show the original state of the page not with updates
        await extendTopic({
            courseTopicContentId,
            userId,
            topicAssessmentInfoId,
            data: {
                extensions: {
                    startDate: inputs.startDate,
                    endDate: inputs.endDate,
                    deadDate: inputs.deadDate ?? inputs.endDate,
                },
                studentTopicAssessmentOverride: {
                    duration: inputs.duration,
                    maxGradedAttemptsPerVersion: inputs.maxGradedAttemptsPerVersion,
                    maxVersions: inputs.maxVersions,
                    versionDelay: inputs.versionDelay,
                }
            }
        });
    };

    const updateQuestions = async (courseTopicQuestionId: number, userId: number, extensions: QuestionExtensions) => {
        await extendQuestion({courseTopicQuestionId, userId, extensions});
    };

    const onSubmit = async (extensions: TopicExtensions | QuestionExtensions) => {
        try {
            if (problem) {
                await updateQuestions(problem.id, userId, extensions as QuestionExtensions);
                setRefetchTopicTriggerForRegrade(new Date().getTime());
            } else if (topic) {
                await updateTopic(topic.id, userId, extensions as TopicExtensions, defaultTopic?.topicAssessmentInfo?.id);
                setRefetchTopicTriggerForRegrade(new Date().getTime());
            } else {
                logger.error('Unhandled override case.');
            }
        } catch (e) {
            setError('server', {
                type: 'manual',
                message: e.message,
            });
        }
    };

    return (
        <FormProvider {...formMethods}>
            <form onChange={() => clearErrors()} onSubmit={handleSubmit(onSubmit)} style={{width: '100%', marginTop: '1.5rem'}}>
                <Grid container justify='center'>
                    <Grid container item md={6} spacing={2}>
                        <Grid item md={12}>
                            {isSubmitSuccessful && <Alert variant='success'>Successfully updated</Alert>}
                            {_(errors).values().map(data => <Alert variant='danger' key={(data as any)?.type}>
                                {(data as any)?.message || 'Please enter an appropriate value'}
                            </Alert>).value()}
                        </Grid>

                        {/* TODO: Use AnimatePresence for a better UX than the flicker or delay. */}
                        {(formLoading || _.isNil(topic) || _.isNil(defaultTopic)) ? (
                            <CircularProgress />
                        ) : (
                            <>
                                {defaultProblem ?
                                    <QuestionOverrideForm question={defaultProblem} topic={topic ?? defaultTopic} /> :
                                    (defaultTopic && <TopicOverrideForm topic={defaultTopic} />)
                                }
                            </>
                        )
                        }

                        <Grid container item md={12} alignItems='flex-start' justify="flex-end" >
                            <Grid item>
                                {_.isSomething(topic) &&
                                <WrappedRegradeTopicButton
                                    saving={isSubmitting}
                                    topicId={topic.id}
                                    questionId={problem?.id}
                                    userId={userId}
                                    topicTrigger={refetchTopicTriggerForRegrade}
                                    style={{fontSize: '1.2em'}}
                                />}
                            </Grid>
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
                                        disabled={formLoading || (defaultProblem && defaultTopic?.topicTypeId === TopicTypeId.EXAM)}
                                    >
                                    Confirm Extension
                                    </Button>)
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </FormProvider>
    );
};

export default ExtensionsForm;