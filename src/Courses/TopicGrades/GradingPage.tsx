import { Grid, Button, Snackbar } from '@material-ui/core';
import { Alert as MUIAlert } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Link, useHistory, useParams, useRouteMatch } from 'react-router-dom';
import logger from '../../Utilities/Logger';
import MaterialBiSelect from '../../Components/MaterialBiSelect';
import { useCourseContext } from '../CourseProvider';
import { UserObject, TopicObject, ProblemObject, StudentGrade, StudentGradeInstance, ProblemState } from '../CourseInterfaces';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { getTopic, startExportOfTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import ExportAllButton from './ExportAllButton';
import { GradeInfoHeader } from './GradeInfoHeader';
import { useQuery } from '../../Hooks/UseQuery';
import AttachmentsPreview from './AttachmentsPreview';
import { useMUIAlertState } from '../../Hooks/useAlertState';
import * as qs from 'querystring';

interface TopicGradingPageProps {
    topicId?: string;
    courseId?: string;
}

interface VersionInfo {
    studentTopicAssessmentInfoId: number;
    endTime: Date;
}

export const TopicGradingPage: React.FC<TopicGradingPageProps> = () => {
    const params = useParams<TopicGradingPageProps>();
    const {users} = useCourseContext();
    const queryParams = useQuery();
    const [gradeAlert, setGradeAlert] = useMUIAlertState();
    const [topic, setTopic] = useState<TopicObject | null>(null);
    const [problems, setProblems] = useState<ProblemObject[] | null>(null);
    const [selected, setSelected] = useState<{
        problem?: ProblemObject,
        user?: UserObject,
        problemState?: ProblemState,
        grade?: StudentGrade,
        gradeInstance?: StudentGradeInstance,
    }>({});
    const { url } = useRouteMatch();
    const history = useHistory();

    useEffect(() => {
        const queryString = qs.stringify(_({
            problemId: selected?.problem?.id ?? queryParams.get('problemId'),
            userId: selected?.user?.id ?? queryParams.get('userId'),
        }).omitBy(_.isNil).value() as any).toString();

        history.replace(`${url}?${queryString}`);
    }, [selected]);

    useEffect(() => {
        logger.debug('GradingPage: topicId changed');
        if (_.isNil(params.topicId)) {
            logger.error('topicId is null');
            throw new Error('An unexpected error has occurred');
        } else {
            fetchProblems(parseInt(params.topicId, 10));
        }
    }, [params.topicId, users]);

    const fetchProblems = async (topicId: number) => {
        // fetchProblems is only called when topicId changes ()
        try {
            const res = await getTopic({ id: topicId, includeQuestions: true });
            const currentProblems = _(res.data.data.questions)
                .map((p) => { return new ProblemObject(p); })
                .sortBy(['problemNumber'], ['asc'])
                .value();
            // currentProblems = _.map(currentProblems, (p) => {return new ProblemObject(p);});
            setProblems(currentProblems);

            const currentTopic = new TopicObject(res.data.data);
            setTopic(currentTopic);

            const problemIdString = queryParams.get('problemId');
            let initialSelectedProblem: ProblemObject | undefined;

            const userIdString = queryParams.get('userId');
            let initialSelectedUser: UserObject | undefined;

            if (!_.isEmpty(currentProblems)) {
                if (_.isNil(problemIdString)) {
                    initialSelectedProblem = currentProblems.first;
                } else {
                    const initialSelectedProblemId = parseInt(problemIdString, 10);
                    initialSelectedProblem = _.find(currentProblems, ['id', initialSelectedProblemId]);
                    logger.debug(`GP: attempting to set intial user #${initialSelectedProblemId}`);
                }
            }
            if (!_.isEmpty(users)) {
                if (_.isNil(userIdString)) {
                    const initialSelectedUserId = _.sortBy(users, ['lastName'], ['desc'])[0].id;
                    initialSelectedUser = _.find(users, { 'id': initialSelectedUserId });
                } else {
                    const initialSelectedUserId = parseInt(userIdString, 10);
                    initialSelectedUser = _.find(users, { 'id': initialSelectedUserId });
                    logger.debug(`GP: attempting to set intial user #${initialSelectedUserId}`);
                }
            }
            setSelected({ user: initialSelectedUser, problem: initialSelectedProblem });
        } catch (e) {
            setGradeAlert({
                severity: 'error',
                message: e.message
            });
        }
    };

    return (
        <Grid>
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
                <Grid item className='text-left'>
                    <h1>Grading {topic && topic.name}</h1>
                </Grid>
                <Grid item>
                    {topic && <ExportAllButton topicId={topic.id} userId={selected.gradeInstance ? selected.user?.id : undefined}/>}
                </Grid>
            </Grid>
            <Grid container spacing={1}>
                <Grid container item md={4}>
                    {problems && users &&
                        <MaterialBiSelect problems={problems} users={users} selected={selected} setSelected={setSelected} />
                    }
                </Grid>
                <Grid container item md={8} style={{paddingLeft: '1rem', height: 'min-content'}}>
                    { selected.user && selected.problem && topic &&
                        < GradeInfoHeader
                            selected={selected}
                            setSelected={setSelected}
                            topic={topic}
                            setGradeAlert={setGradeAlert}
                        />
                    }
                    <Grid container alignItems='stretch'>
                        {selected.problem && selected.user && selected.grade &&
                        // (selected.problemState?.workbookId || selected.problemState?.studentTopicAssessmentInfoId || selected.problemState?.previewPath) &&
                            < ProblemIframe
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
                                gradeId={selected?.grade?.id}
                                gradeInstanceId={selected?.gradeInstance?.id}
                                // Workbooks don't seem to be loading in the database right now,
                                // but a professor shouldn't really care about this level. Attachments should show the same for
                                // all attempts, maybe even all versions?
                                // workbookId={selected.workbook?.id}
                            />
                        </Grid>
                    }
                </Grid>
            </Grid>
        </Grid>
    );
};

export default TopicGradingPage;