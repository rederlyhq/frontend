import { Grid, Snackbar, Container, ListSubheader, Button, Box } from '@material-ui/core';
import { Alert as MUIAlert, Alert } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useParams, Link } from 'react-router-dom';
import logger from '../../Utilities/Logger';
import MaterialBiSelect from '../../Components/MaterialBiSelect';
import { useCourseContext } from '../CourseProvider';
import { UserObject, TopicObject, ProblemObject, StudentGrade, StudentGradeInstance, ProblemState, StudentWorkbookInterface } from '../CourseInterfaces';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { getTopic, getTopicFeedback, getGrades, getStudentGrades } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import ExportAllButton from './ExportAllButton';
import { GradeInfoHeader } from './GradeInfoHeader';
import AttachmentsPreview from './AttachmentsPreview';
import { useMUIAlertState } from '../../Hooks/useAlertState';
import { NamedBreadcrumbs, useBreadcrumbLookupContext } from '../../Contexts/BreadcrumbContext';
import { useQueryParam, NumberParam } from 'use-query-params';
import { getUserId, getUserRole, UserRole } from '../../Enums/UserRole';
import { QuillReadonlyDisplay } from '../../Components/Quill/QuillReadonlyDisplay';
import { GradeFeedback } from './GradeFeedback';
import '../../Components/LayoutStyles.css';
import 'react-quill/dist/quill.snow.css';
import { TopicObjectWithLocalGrades, ProblemObjectWithLocalGrades } from './GradingInterfaces';

interface GradingPageProps {
    topicId?: string;
    courseId?: string;
}

interface GradingSelectables {
    problem?: ProblemObject | null,
    user?: UserObject,
    problemState?: ProblemState,
    grade?: StudentGrade,
    gradeInstance?: StudentGradeInstance,
}

export interface WorkbookInfoDump {
    workbook?: StudentWorkbookInterface;
    legalScore?: number;
    overallBestScore?: number;
    partialCreditBestScore?: number;
    effectiveScore?: number;
    workbookId?: number;
    studentGradeId?: number;
    studentGradeInstanceId?: number;
    averageScore?: number;
    attemptsCount?: number;
    versionMap?: Record<number, Array<number> | undefined>;
}


export const GradingPage: React.FC<GradingPageProps> = () => {
    const params = useParams<GradingPageProps>();
    const {course, users} = useCourseContext();
    const [userId, setUserId] = useQueryParam('userId', NumberParam);
    const [problemId, setProblemId] = useQueryParam('problemId', NumberParam);
    const [gradeAlert, setGradeAlert] = useMUIAlertState();
    const [topic, setTopic] = useState<TopicObject | null | undefined>();
    const [topicWithLocalGrade, setTopicWithLocalGrade] = useState<TopicObjectWithLocalGrades | null | undefined>();
    const [topicFeedback, setTopicFeedback] = useState<unknown>();
    const [selected, setSelected] = useState<GradingSelectables>({});
    const [info, setInfo] = useState<WorkbookInfoDump | null>(null);
    const {updateBreadcrumbLookup} = useBreadcrumbLookupContext();
    const currentUserRole = getUserRole();
    const currentUserId = getUserId();

    const nextProblem = (increment: boolean) => {
        if (_.isNil(topic)) {
            logger.error('GradingPage: nextProblem: nil topic');
            return;
        }

        if (_.isEmpty(topic.questions)) {
            logger.error('GradingPage: nextProblem: empty questions');
            return;
        }

        let nextIndex: number;
        if (_.isNil(problemId)) {
            nextIndex = increment ? 0 : (topic.questions.length - 1);
        } else {
            const problemIndex = _.findIndex(topic.questions, ['id', problemId]);
            if (problemIndex < 0) {
                logger.warn('GradingPage: nextProblem: problem not found');
            }    
            // nextIndex = increment ?
            //     (problemIndex + 1) % topic.questions.length :
            //     (problemIndex + topic.questions.length - 1) % topic.questions.length;
            // This intentionaly does not use modulus since wrapping doesn't bring it to the first or last problem but rather topic grades
            // Overflow and underflow default to null which is topic grades
            nextIndex = problemIndex + ((Number(increment) * 2) - 1);
        }
        let nextProblem: ProblemObject | null | undefined = null;

        if (nextIndex >= 0 && nextIndex < topic.questions.length) {
            nextProblem = topic.questions[nextIndex];
        }

        setSelected((current) => ({
            ...current,
            problem: nextProblem,
        }));
    };

    const nextUser = (increment: boolean) => {
        if (currentUserRole === UserRole.STUDENT) {
            logger.warn('GradingPage: nextUser: student tried to use next user');
            return;
        }

        if (_.isNil(userId)) {
            logger.warn('GradingPage: nextUser: nil userId');
            return;
        }

        if (_.isEmpty(users)) {
            logger.warn('GradingPage: nextUser: empty users');
            return;
        }

        let nextUser: UserObject | null | undefined = null;
        const userIndex = _.findIndex(users, { 'id': userId });
        if (userIndex < 0) {
            logger.warn('GradingPage: nextUser: user not found');
        }
        // userIndex + or - 1, = user length to avoid underflow, mod user lenth to keep in array bounds
        const nextIndex = (userIndex + ((Number(increment) * 2) - 1) + users.length) % users.length;

        nextUser = users[nextIndex];

        setSelected((current) => ({
            ...current,
            ..._.omitBy({
                user: nextUser
            }, _.isNull)
        }));
    };

    useEffect(() => {
        (async () => {
            logger.debug('GP: there has been a change in user or topic, fetching new cumulative topic grade.');
        
            if (_.isNil(topic)) {
                logger.debug('GP: topic id is nil, skipping user-specific grades effect');
                return;
            }
        
            if (_.isNil(selected.user)) {
                logger.debug('GP: user id is nil, skipping user-specific grades effect');
                return;
            }

            const params = {
                topicId: topic.id,
                userId: selected.user.id // check selected.user not nil?
            };

            try {
                const result = await getGrades(params);
                const topicWithGrades = new TopicObjectWithLocalGrades(topic);
                topicWithGrades.localGrade = result.data.data.first?.average;
                const grades = await getStudentGrades({
                    courseId: course.id,
                    courseTopicContentId: topic.id,
                    userId: selected.user.id,
                });
                const questionGrades = grades.data.data.data;
                topicWithGrades.questions = topic.questions.map(question => {
                    const questionWithGrades = new ProblemObjectWithLocalGrades(question);
                    questionWithGrades.localGrade = _.find(questionGrades, ['id', questionWithGrades.id])?.averageScore;
                    return questionWithGrades;
                });
                setTopicWithLocalGrade(topicWithGrades);
            } catch (e) {
                setGradeAlert({
                    severity: 'error',
                    message: e.message,
                });
            }
        })();
    }, [selected.user, topic, info?.effectiveScore, setGradeAlert, course.id]);

    // Get topic feedback
    useEffect(()=>{
        (async () => {
            if (!selected.user || selected.problem || !topic) return;
            
            try {
                const res = await getTopicFeedback({
                    topicId: topic.id,
                    userId: selected.user.id,
                });
        
                setTopicFeedback(res.data.data?.feedback);
            } catch (e) {
                setTopicFeedback(null);
                logger.error(e);
            }
        })();
    }, [selected.problem, selected.user, topic]);

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
            logger.warn('No topic found on Grading Page.');
            return;
        }

        if (_.isEmpty(topic.questions)) {
            logger.warn('No questions found for topic on Grading Page.');
            return;
        }

        // TODO: This check won't work for a Student-accessible grading page.
        if (_.isEmpty(users)) {
            logger.warn('No users found for Grading Page.');
            return;    
        }

        const currentProblems = topic.questions;
        
        let initialSelectedProblem: ProblemObject | null | undefined = null;

        let initialSelectedUser: UserObject | undefined;

        if (!_.isNil(problemId)) {
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
        // This is undefined on page load, but null if Topic is specifically selected.
        if (selected.problem !== undefined) {
            setProblemId(selected.problem?.id ?? undefined);
        }
    }, [currentUserRole, selected, setProblemId, setUserId]);

    useEffect(()=>{
        logger.debug('Updating breadcrumb.');
        if (_.isNil(topic)) return;
        updateBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: topic.name});
    }, [updateBreadcrumbLookup, topic]);

    if (_.isNull(topic) || _.isNull(topicWithLocalGrade)) {
        return <h1>Failed to load the topic.</h1>;
    } else if (_.isUndefined(topic) || _.isUndefined(topicWithLocalGrade)) {
        return <h1>Loading</h1>;
    }

    let maxWidth = undefined;
    let biselectSize: 3 | 4 = 3;
    let paneSize: 9 | 8 = 9;
    
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
            <Grid
                container
                style={{
                    height: 'calc(100vh - 260px)',
                }}
            >
                {/* Student / problem selector grid */}
                <Grid
                    container
                    item
                    md={biselectSize}
                    className='col-remove-scrollbar-padding'
                    style={{
                        height: '100%',
                        overflowY: 'auto',
                        // The child with .MuiGrid-spacing-xs-1 adds a -4px margin which was causing scroll bars to always be present, padding fixes this
                        padding: '4px',
                        // There was a horizontal scroll (don't know what caused it), increasing right padding fixes the horizontal scroll
                        paddingRight: '16px',
                    }}
                >
                    {!_.isEmpty(topicWithLocalGrade.questions) &&
                        <MaterialBiSelect 
                            topic={topicWithLocalGrade}
                            problems={topicWithLocalGrade.questions} 
                            users={currentUserRole === UserRole.STUDENT ? [] : users} 
                            selected={selected} 
                            setSelected={setSelected} 
                        />
                    }
                </Grid>
                <Grid
                    container
                    item
                    md={paneSize}
                    style={{
                        height: '100%',
                        paddingLeft: '5rem',
                        // height: 'min-content',
                    }}
                >
                    <div style={{position: 'relative', width: '100%', height: '100%'}}>
                        <Box
                            style= {{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                            }}
                            display="flex"
                            flexWrap="nowrap"
                        >
                            <Button
                                onClick={() => nextProblem(false)}
                                color='primary'
                                variant='outlined'
                            >
                                Previous Problem
                            </Button>
                            {currentUserRole !== UserRole.STUDENT &&
                                <Button
                                    onClick={() => nextUser(false)}
                                    color='default'
                                    variant='outlined'
                                >
                                    Previous User
                                </Button>
                            }
                            <div style={{
                                margin: 'auto'
                            }}></div>
                            {currentUserRole !== UserRole.STUDENT &&
                                <Button
                                    onClick={() => nextUser(true)}
                                    color='default'
                                    variant='outlined'
                                >
                                    Next User
                                </Button>
                            }
                            <Button
                                onClick={() => nextProblem(true)}
                                color='primary'
                                variant='outlined'
                            >
                                Next Problem
                            </Button>
                        </Box>
                        <div
                            className='col-remove-scrollbar-padding'
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: '60px',
                                bottom: 0,
                                overflowY: 'auto',
                                // There was a horizontal scroll (don't know what caused it), increasing right padding fixes the horizontal scroll
                                paddingRight: '4px',
                            }}
                        >
                            { selected.user && 
                                (selected.problem ?
                                    <GradeInfoHeader
                                        selected={selected}
                                        setSelected={setSelected}
                                        topic={topic}
                                        setGradeAlert={setGradeAlert}
                                        info={info}
                                        setInfo={setInfo}
                                    /> : 
                                    <p>
                                        <h2>Total Score: {topicWithLocalGrade.localGrade?.toPercentString() ?? '--'}</h2>
                                    </p>)
                            }
                            {selected.user && 
                            ((currentUserRole !== UserRole.STUDENT && (info?.workbook || _.isNull(selected.problem))) || 
                            ((!selected.problem && topicFeedback) || (selected.problem && info?.workbook?.feedback))) && 
                            <Grid container item>
                                <ListSubheader disableSticky>
                                    <h2>Feedback</h2>
                                </ListSubheader>
                                {(currentUserRole === UserRole.STUDENT ? 
                                    <QuillReadonlyDisplay content={selected.problem ? info?.workbook?.feedback : topicFeedback} /> : 
                                    <GradeFeedback 
                                        workbookId={selected.problem ? info?.workbook?.id : undefined} 
                                        setGradeAlert={setGradeAlert} 
                                        defaultValue={selected.problem ? info?.workbook?.feedback : topicFeedback} 
                                        topicId={topic.id}    
                                        userId={selected.user.id}
                                    />)}
                            </Grid>}
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
                        </div>
                    </div>
                </Grid>
            </Grid>
        </Container>
    );
};

export default GradingPage;