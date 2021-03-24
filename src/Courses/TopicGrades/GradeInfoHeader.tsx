import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { ProblemObject, ProblemState, StudentGrade, StudentGradeInstance, StudentWorkbookInterface, TopicObject, UserObject } from '../CourseInterfaces';
import logger from '../../Utilities/Logger';
import { Button, Grid } from '@material-ui/core';
import { OverrideGradeModal } from '../CourseDetailsTabs/OverrideGradeModal';
import { getGrades, getQuestionGrade } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { Spinner } from 'react-bootstrap';
import { Color } from '@material-ui/lab';
import { WorkbookSelect } from './WorkbookSelect';

interface GradeInfoHeaderProps {
    topic: TopicObject;
    selected: {
        problem?: ProblemObject,
        user?: UserObject,
        problemState?: ProblemState,
        grade?: StudentGrade,
        gradeInstance?: StudentGradeInstance,
    };
    setSelected: React.Dispatch<React.SetStateAction<{
        problem?: ProblemObject,
        user?: UserObject,
        problemState?: ProblemState,
        grade?: StudentGrade,
        gradeInstance?: StudentGradeInstance,
    }>>;
    setGradeAlert: React.Dispatch<React.SetStateAction<{
        message: string;
        severity: Color;
    }>>;
}

interface WorkbookInfoDump {
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

export const GradeInfoHeader: React.FC<GradeInfoHeaderProps> = ({
    selected,
    setSelected,
    topic,
    setGradeAlert,
}) => {
    const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
    const [topicGrade, setTopicGrade] = useState<number | null>(null);
    const [grade, setGrade] = useState<StudentGrade | null>(null);
    const [info, setInfo] = useState<WorkbookInfoDump>({});

    // Get and Store Grade.
    useEffect(() => {
        logger.debug(`GradeInfoHeader: there has been a change in user (${selected.user?.id}) or problem (${selected.problem?.id}), fetching new problem grade info.`);

        (async () => {
            setGrade(null);
            if (_.isNil(selected.user) || _.isNil(selected.problem)) {
                logger.error('Either UserId or ProblemId are null at this point.');
                return;
            }
            logger.debug(`GradeInfoHeader: Fetching question grade for problem #${selected.problem?.id} and user #${selected.user?.id}`);

            try {
                const res = await getQuestionGrade({
                    userId: selected.user.id,
                    questionId: selected.problem.id,
                    includeWorkbooks: true,
                });

                if (_.isNil(res.data)) {
                    logger.error(`Failed to retrieve grade for user #${selected.user.id} on problem #${selected.problem.id}`);
                    throw new Error(`Failed to retrieve grade for Problem ID ${selected.problem.id}`);
                } 
                
                setGrade(res.data.data);
            } catch (e) {
                setGradeAlert({
                    severity: 'error',
                    message: e.message,
                });
            }
        })();
    }, [selected.problem, selected.user, setGradeAlert]);

    useEffect(() => {
        logger.debug('GradeInfoHeader: student grade object has changed.', grade);

        if (!_.isNil(grade)) {
            const workbooks = _.keyBy(grade.workbooks, 'id');

            let currentAttemptsCount: number = 0;
            let currentAverageScore: number = 0;
            let currentVersionMap: Record<number, Array<number> | undefined> = {};

            if (!_.isNil(workbooks) && !_.isEmpty(workbooks)) {
                const workbookKeys = Object.keys(workbooks);
                currentAttemptsCount = workbookKeys.length;

                currentAverageScore = _.reduce(workbooks, (sum, wb) => sum + wb.result, 0) / currentAttemptsCount;

                if (_.isEmpty(workbookKeys)) {
                    logger.error(`User ${grade.userId} has non-empty workbooks for grade ${grade.id} but none of them have ids.`);
                    return;
                }

                currentVersionMap = _.reduce(workbooks, (map, wb, id) => {
                    if (!_.isNil(wb.studentGradeInstanceId)) {
                        map[wb.studentGradeInstanceId] = [...(map[wb.studentGradeInstanceId] ?? []), parseInt(id, 10)];
                    } else {
                        // there should only be one studentGradeId in this case...
                        map[wb.studentGradeId] = [...(map[wb.studentGradeId] ?? []), parseInt(id, 10)];

                        if (wb.studentGradeId !== grade.id) {
                            logger.error(`Workbooks for grade ${grade.id} are out of sync with the corresponding grade object.`);
                        }
                    }
                    return map;
                }, {} as { [k: number]: number[] | undefined });

                // In this case, the latest version has not been submitted yet.
                const currentVersionMapKeys = _.keys(currentVersionMap);
                if (grade.gradeInstances && currentVersionMapKeys.length >= grade.gradeInstances.length - 1) {
                    _.forEach(grade.gradeInstances, gradeInstance => {
                        currentVersionMap[gradeInstance.id] = currentVersionMap[gradeInstance.id] ?? [];
                    });
                }
            }

            // set default selection to the last attempt that impacted the user's grade
            // if they never did the problem for credit -- fall back to the last influencing
            const workbookId = grade.lastInfluencingCreditedAttemptId ?? grade.lastInfluencingAttemptId;
            const workbook = _.find(grade.workbooks, ['id', workbookId]);
            const studentGradeInstanceId = workbook?.studentGradeInstanceId;

            logger.debug('GradeInfoHeader: Setting local info from new grade object.', currentVersionMap);
            setInfo({
                legalScore: grade.legalScore,
                overallBestScore: grade.overallBestScore,
                partialCreditBestScore: grade.partialCreditBestScore,
                effectiveScore: grade.effectiveScore,
                workbook,
                workbookId,
                studentGradeId: grade.id,
                studentGradeInstanceId,
                attemptsCount: currentAttemptsCount,
                averageScore: currentAverageScore,
                versionMap: currentVersionMap,
            });
        } else {
            logger.debug(`GradeInfoHeader: Student grade has not been set for this combination of user (${selected.user?.id}) and problem (${selected.problem?.id}).`);
            setInfo({});
        }
    }, [grade?.id]);

    useEffect(() => {
        logger.debug('GradeInfoHeader: setting new problem state from updated Workbook ID or Grade (Instance) ID', info);
        const newProblemState: ProblemState = {};
        const currentGrade = (grade) ? grade : undefined;

        if (_.isNil(grade)) {
            // no grade for this user/problem combo -> error was already caught
            // this still happens on initial page load, so debug
            logger.debug(`GradeInfoHeader: No grade for this combination of user (${selected.user?.id}) and problem (${selected.problem?.id}).`);
        } else if ((_.isNil(grade.workbooks) || _.isEmpty(grade.workbooks)) &&
            !_.isNil(topic.topicAssessmentInfo) &&
            (_.isNil(grade.gradeInstances) || _.isEmpty(grade.gradeInstances))
        ) {
            // no workbooks on an exam, so get previewPath and previewSeed because there cannot be a current state
            logger.debug('Unattempted problem on an exam');
            newProblemState.previewPath = selected.problem?.webworkQuestionPath;
            newProblemState.previewSeed = grade.randomSeed;
        } else if (_.isNil(grade.workbooks) || _.isNil(info.workbookId) || info.workbookId === -1) {
            // no workbooks, or none selected -> use currentProblemState (need version info if an exam... grade instance ID will not suffice)
            if (!_.isNil(info.studentGradeInstanceId) && !_.isNil(grade.gradeInstances) && !_.isEmpty(grade.gradeInstances)) {
                newProblemState.studentTopicAssessmentInfoId = _.find(grade.gradeInstances, ['id', info.studentGradeInstanceId])?.studentTopicAssessmentInfoId;
                logger.debug(`GradeInfoHeader: setting Problem State - versionId: ${newProblemState.studentTopicAssessmentInfoId}`);
            }
        } else if (_.isNil(_.find(grade.workbooks, ['id', info.workbookId]))) {
            // we have workbooks, and one is selected, but entry doesn't exist -> error
            logger.error(`GradeInfoHeader: User #${selected.user?.id} tried to set workbook #${info.workbookId} for problem #${selected.problem?.id} but I cannot find that record.`);
        } else {
            newProblemState.workbookId = info.workbookId;
            logger.debug(`GradeInfoHeader: setting Problem State - workbookId: ${newProblemState.workbookId}`);
        }

        const newGradeInstance = (info.studentGradeInstanceId) ? _.find(grade?.gradeInstances, ['id', info.studentGradeInstanceId]) : undefined;
        logger.debug('GradeInfoHeader: setting new selected grades', newProblemState, newGradeInstance);
        setSelected(selected => ({ ...selected, problemState: newProblemState, grade: currentGrade, gradeInstance: newGradeInstance }));
    }, [info.workbookId, info.studentGradeId, info.studentGradeInstanceId]);

    useEffect(() => {
        logger.debug('GradeInfoHeader: there has been a change in user or topic, fetching new cumulative topic grade.');
        setTopicGrade(null);
        if (_.isNil(topic)) {
            logger.debug('GradeInfoHeader: topic id is nil, skipping grades call');
            return;
        }

        const params = {
            topicId: topic.id,
            userId: selected.user?.id // check selected.user not nil?
        };

        (async () => {
            try {
                const result = await getGrades(params);
                setTopicGrade(result.data.data.first?.average ?? null);
            } catch (e) {
                setGradeAlert({
                    severity: 'error',
                    message: e.message,
                });
            }
        })();
    }, [selected.user, topic, info.effectiveScore, setGradeAlert]);

    const onSuccess = (gradeOverride: Partial<StudentGrade>) => {
        logger.debug('GradeInfoHeader: overriding grade', gradeOverride.effectiveScore);
        const currentGrade = grade;
        if (!_.isNil(gradeOverride) &&
            !_.isNil(gradeOverride.effectiveScore) &&
            !_.isNil(currentGrade)
        ) {
            currentGrade.effectiveScore = gradeOverride.effectiveScore;
            setGrade(currentGrade);
        }
    };


    if (_.isNil(grade) || _.isNil(info)) {
        return ( <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>) ;
    }

    return (
        <Grid container spacing={1} style={{ paddingLeft: '1rem' }} alignItems='flex-start'>
            <Grid item xs={12}>
                <h3>Total Topic Score: {topicGrade?.toPercentString() ?? '--'}</h3>
            </Grid>
            <Grid item xs={6}>
                <h4>Statistics</h4>
                Number of attempts: <strong>{info.attemptsCount}</strong><br />
                Best overall score: <strong>{info.overallBestScore?.toPercentString()}</strong><br />
                {/* Should check !moment(topic.endDate).isSame(topic.deadDate) for topic and overrides before showing this? */}
                System score: <strong>{info.partialCreditBestScore?.toPercentString()}</strong><br />
                Score from best exam submission: <strong>{info.legalScore?.toPercentString()}</strong><br />
                Average score: <strong>{info.averageScore?.toPercentString()}</strong>
            </Grid>
            <Grid item xs={6}>
                <h4>Grades</h4>
                Effective score for grades: <strong>{info.effectiveScore?.toPercentString()}</strong><br />
                {grade &&
                <>
                    <Button
                        variant='outlined'
                        onClick={() => setShowGradeModal(true)}
                    >
                    Set new score for grades
                    </Button>
                    <OverrideGradeModal
                        show={showGradeModal}
                        onHide={() => setShowGradeModal(false)}
                        grade={grade}
                        onSuccess={(newGrade: Partial<StudentGrade>) => {
                            if (!_.isNil(newGrade.effectiveScore)) {
                                setInfo(info => ({ ...info, effectiveScore: newGrade.effectiveScore }));
                                onSuccess(newGrade);
                            }
                        }}
                    /><br />
                </>}
                {info.workbook &&
                    <p>
                        Score on this attempt: <strong>{info.workbook.result.toPercentString()}</strong>
                    </p>
                }
            </Grid>
            {grade &&
            <Grid item xs={12}>
                {(info.versionMap && info.workbookId)?
                    <WorkbookSelect
                        versionMap={info.versionMap}
                        versionKey={info.studentGradeInstanceId ?? grade.id}
                        attemptKey={info.workbookId}
                        onChange={setInfo}
                        info={info}
                        grade={grade}
                    /> :
                    `${selected.user?.name} has not attempted this problem.`
                }
            </Grid>}
        </Grid>
    );
};