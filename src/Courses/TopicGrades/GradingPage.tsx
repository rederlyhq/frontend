import { Grid, Snackbar, Container, Chip } from '@material-ui/core';
import { Alert as MUIAlert, Alert } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useParams, Link } from 'react-router-dom';
import logger from '../../Utilities/Logger';
import MaterialBiSelect from '../../Components/MaterialBiSelect';
import { useCourseContext } from '../CourseProvider';
import { UserObject, TopicObject, ProblemObject, StudentGrade, StudentGradeInstance, ProblemState } from '../CourseInterfaces';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { getTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import ExportAllButton from './ExportAllButton';
import { GradeInfoHeader } from './GradeInfoHeader';
import AttachmentsPreview from './AttachmentsPreview';
import { useMUIAlertState } from '../../Hooks/useAlertState';
import { NamedBreadcrumbs, useBreadcrumbLookupContext } from '../../Contexts/BreadcrumbContext';
import { useQueryParam, NumberParam } from 'use-query-params';
import { getUserId, getUserRole, UserRole } from '../../Enums/UserRole';
import '../../Components/LayoutStyles.css';

import 'react-quill/dist/quill.snow.css';

interface GradingPageProps {
    topicId?: string;
    courseId?: string;
}

interface GradingSelectables {
    problem?: ProblemObject,
    user?: UserObject,
    problemState?: ProblemState,
    grade?: StudentGrade,
    gradeInstance?: StudentGradeInstance,
}

export const GradingPage: React.FC<GradingPageProps> = () => {
    const params = useParams<GradingPageProps>();
    const {users} = useCourseContext();
    const [userId, setUserId] = useQueryParam('userId', NumberParam);
    const [problemId, setProblemId] = useQueryParam('problemId', NumberParam);
    const [gradeAlert, setGradeAlert] = useMUIAlertState();
    const [topic, setTopic] = useState<TopicObject | null | undefined>();

    const [selected, setSelected] = useState<GradingSelectables>({});
    const [topicGrade, setTopicGrade] = useState<number | null>(null);
    const {updateBreadcrumbLookup} = useBreadcrumbLookupContext();
    const currentUserRole = getUserRole();
    const currentUserId = getUserId();

    useEffect(()=>{
        logger.debug('Fetching topic', params.topicId);
        (async ()=>{
            try {
                if (_.isNil(params.topicId)) {
                    logger.error(`Failed to load Topic ${params.topicId}`);
                    throw new Error('Failed to load the selected topic. This error has been reported.');
                }

                const topicId = parseInt(params.topicId, 10);
                const res = await getTopic({ id: topicId, includeQuestions: true });
                
                const currentTopic = new TopicObject(res.data.data);
                setTopic(currentTopic);
            } catch (e) {
                setGradeAlert({
                    severity: 'error',
                    message: `Failed to load topic (${e.message}).`
                });
            }
        })();
    }, [params.topicId, setGradeAlert]);

    useEffect(()=>{
        logger.debug('Updating selected items after the topic (or another dep) has changed.');
        if (_.isNil(topic)) {
            return;
        }

        if (_.isEmpty(topic.questions)) {
            return;
        }

        // TODO: This check won't work for a Student-accessible grading page.
        if (_.isEmpty(users)) {
            return;    
        }

        const currentProblems = topic.questions;
        
        let initialSelectedProblem: ProblemObject | undefined;

        let initialSelectedUser: UserObject | undefined;

        if (_.isNil(problemId)) {
            initialSelectedProblem = currentProblems.first;
        } else {
            initialSelectedProblem = _.find(currentProblems, ['id', problemId]);
            logger.debug(`GP: attempting to set initial problem #${problemId}`);
        }

        if (currentUserRole === UserRole.STUDENT) {
            initialSelectedUser = _.find(users, { 'id': currentUserId });
        } else if (_.isNil(userId)) {
            // TODO: Default to current user id for single student?
            initialSelectedUser = users[0];
        } else {
            initialSelectedUser = _.find(users, { 'id': userId });
            logger.debug(`GP: attempting to set initial user #${userId}`);
        }

        setSelected({ user: initialSelectedUser, problem: initialSelectedProblem });
    }, [topic, users, setGradeAlert, problemId, userId, currentUserRole, currentUserId]);

    useEffect(()=>{
        logger.debug('Syncing query parameters.');
        if (currentUserRole !== UserRole.STUDENT) {
            // This can be null on page load, so we have to prevent that from overwriting the param.
            selected.user && setUserId(selected.user.id);
        } else {
            setUserId(undefined);
        }
        selected.problem && setProblemId(selected.problem.id);
    }, [currentUserRole, selected, setProblemId, setUserId]);

    useEffect(()=>{
        logger.debug('Updating breadcrumb.');
        if (_.isNil(topic)) return;
        updateBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: topic.name});
    }, [updateBreadcrumbLookup, topic]);

    if (_.isNull(topic)) {
        return <h1>Failed to load the topic.</h1>;
    } else if (_.isUndefined(topic)) {
        return <h1>Loading</h1>;
    }

    let maxWidth = undefined;
    let biselectSize: 2 | 4 = 2;
    let paneSize: 10 | 8 = 10;
    
    if (currentUserRole !== UserRole.STUDENT) {
        maxWidth = '90vw';
        biselectSize = 4;
        paneSize = 8;
    }

    return (
        <Container disableGutters maxWidth='lg' style={{maxWidth: maxWidth}} >
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={gradeAlert.message !== ''}
                autoHideDuration={gradeAlert.severity === 'success' ? 6000 : undefined}
                onClose={() => setGradeAlert(alertState => ({ ...alertState, message: '' }))}
                style={{ maxWidth: '50vw' }}
            >
                <MUIAlert
                    onClose={() => setGradeAlert(alertState => ({ ...alertState, message: '' }))}
                    severity={gradeAlert.severity}
                    variant='filled'
                    style={{ fontSize: '1.1em' }}
                >
                    {gradeAlert.message}
                </MUIAlert>
            </Snackbar>
            <Grid container spacing={1} alignItems='center' justify='space-between'>
                <Grid container item className='text-left' xs={6} alignItems='center'>
                    <h1>Grading {topic.name}</h1>
                    <Chip label={topicGrade ? topicGrade.toPercentString() : '--'} color='primary' size='small' />
                </Grid>
                {currentUserRole !== UserRole.STUDENT && <Grid item>
                    <ExportAllButton topicId={topic.id} userId={selected.user?.id} />
                </Grid>}
            </Grid>
            {_.isEmpty(users) && <Alert color='error'>
                There are no students enrolled in this course.
                If you want to view your Assignment, <Link to={`/common/courses/${params.courseId}/topic/${params.topicId}`}>click here to visit the Assignment page</Link>.
                Otherwise, you can <Link to={`/common/courses/${params.courseId}?tab=Enrollments`}>enroll students in the enrollments tab</Link>.
            </Alert>}
            {_.isEmpty(topic.questions) && <Alert color='error'>There are no problems in this topic. You can add problems <Link to={`/common/courses/${params.courseId}/topic/${params.topicId}/settings`}>here</Link>. </Alert>}
            <Grid container>
                <Grid container item md={biselectSize}>
                    {!_.isEmpty(topic.questions) &&
                        <MaterialBiSelect problems={topic.questions} users={currentUserRole === UserRole.STUDENT ? [] : users} selected={selected} setSelected={setSelected} />
                    }
                </Grid>
                <Grid container item md={paneSize} style={{paddingLeft: '5rem', height: 'min-content'}}>
                    { selected.user && selected.problem &&
                        <GradeInfoHeader
                            selected={selected}
                            setSelected={setSelected}
                            topic={topic}
                            setGradeAlert={setGradeAlert}
                            setTopicGrade={setTopicGrade}
                        />
                    }
                    <Grid container item alignItems='stretch'>
                        {selected.problem && selected.user && selected.grade &&
                        // (selected.problemState?.workbookId || selected.problemState?.studentTopicAssessmentInfoId || selected.problemState?.previewPath) &&
                            <ProblemIframe
                                problem={selected.problem}
                                userId={selected.user.id}
                                readonly={true}
                                workbookId={selected.problemState?.workbookId}
                                studentTopicAssessmentInfoId={selected.problemState?.studentTopicAssessmentInfoId}
                                previewPath={selected.problemState?.previewPath}
                                previewSeed={selected.problemState?.previewSeed}
                            />
                        }
                    </Grid>
                    {(selected.grade || selected.gradeInstance) &&
                        <Grid container item md={12}>
                            <AttachmentsPreview
                                gradeId={selected.grade?.id}
                                gradeInstanceId={selected.gradeInstance?.id}
                                // Workbooks don't seem to be loading in the database right now,
                                // but a professor shouldn't really care about this level. Attachments should show the same for
                                // all attempts, maybe even all versions?
                                // workbookId={selected.workbook?.id}
                            />
                        </Grid>
                    }
                </Grid>
            </Grid>
        </Container>
    );
};

export default GradingPage;