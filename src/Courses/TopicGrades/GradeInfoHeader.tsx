import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { ProblemObject, ProblemState, StudentGrade, StudentGradeInstance, TopicObject, UserObject } from '../CourseInterfaces';
import logger from '../../Utilities/Logger';
import { Button, FormControl, Grid, InputLabel, makeStyles, Select } from '@material-ui/core';
import { OverrideGradeModal } from '../CourseDetailsTabs/OverrideGradeModal';
import { getGrades, getQuestionGrade } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { Spinner } from 'react-bootstrap';

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
}

type WorkbookOption = {
    value: number;
    label: string;
};

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export const GradeInfoHeader: React.FC<GradeInfoHeaderProps> = ({
    selected,
    setSelected,
    topic
}) => {
    const classes = useStyles();
    const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
    const [topicGrade, setTopicGrade] = useState<number | null>(null);
    const [grade, setGrade] = useState<StudentGrade | null>(null);
    const [info, setInfo] = useState<{
        legalScore?: number;
        overallBestScore?: number;
        partialCreditBestScore?: number;
        effectiveScore?: number;
        workbookId?: number;
        studentGradeId?: number;
        studentGradeInstanceId?: number;
        averageScore?: number;
        attemptsCount?: number;
        versionMap?: Record<number, Array<number>>;
        // workbookList?: WorkbookOption[];
    }>({});
    const displayCurrentScore = useRef<string | null>(null);
    // fetch grade first
    if (_.isNil(displayCurrentScore.current) && !_.isNil(grade)) {
        displayCurrentScore.current = (grade?.effectiveScore * 100).toFixed(1);
    }

    const fetchGrade = async () => {
        setGrade(null);
        if (!_.isNil(selected.user) && !_.isNil(selected.problem)) {
            const res = await getQuestionGrade({
                userId: selected.user.id,
                questionId: selected.problem.id,
                includeWorkbooks: true,
            });

            if (_.isNil(res.data)) {
                logger.error(`Failed to retrieve grade for user #${selected.user.id} on problem #${selected.problem.id}`);
            } else {
                setGrade(res.data.data);
            }
        } else {
            setGrade(null);
        }
    };
    useEffect(() => {
        logger.debug(`GradeInfoHeader: there has been a change in user (${selected.user?.id}) or problem (${selected.problem?.id}), fetching new problem grade info.`);
        fetchGrade();
    }, [selected.problem, selected.user]);

    useEffect(() => {
        logger.debug('GradeInfoHeader: student grade object has been updated.', grade);
        if (!_.isNil(grade)) {
            const workbooks = _.keyBy(grade.workbooks, 'id');
            let currentAttemptsCount: number | undefined;
            let currentAverageScore: number | undefined;
            let currentVersionMap: Record<number, Array<number>> = {};
            // let versioned = false;
            if (!_.isNil(workbooks) && !_.isEmpty(workbooks)) {
                const workbookKeys = Object.keys(workbooks);
                // versioned = !_.isNil(Object.values(workbooks)[0].studentGradeInstanceId);
                currentAttemptsCount = workbookKeys.length;
                currentAverageScore = _.reduce(workbooks, (sum, wb) => {
                    return sum + wb.result;
                }, 0) / currentAttemptsCount;
                if (!_.isEmpty(workbookKeys)) {
                    currentVersionMap = _.reduce(workbooks, (map, wb, id) => {
                        if (!_.isNil(wb.studentGradeInstanceId)) {
                            (map[wb.studentGradeInstanceId] || (map[wb.studentGradeInstanceId] = [])).push(parseInt(id, 10));
                        } else {
                            // there should only be one studentGradeId in this case...
                            (map[wb.studentGradeId] || (map[wb.studentGradeId] = [])).push(parseInt(id, 10));
                            if (wb.studentGradeId !== grade.id) logger.error(`Workbooks for grade ${grade.id} are out of sync with the corresponding grade object.`);
                        }
                        return map;
                    }, {} as { [k: number]: number[] });
                } else {
                    logger.error(`User ${grade.userId} has non-empty workbooks for grade ${grade.id} but none of them have ids.`);
                }
            } else {
                currentAttemptsCount = 0;
                currentAverageScore = 0;
            }
            // const currentWorkbookList = workbookList(currentVersionMap, versioned);
            // logger.debug('GradeInfoHeader: setting workbook list: ', currentWorkbookList);

            // set default selection to the last attempt that impacted the user's grade
            const workbookId = (grade.lastInfluencingCreditedAttemptId) ? grade.lastInfluencingCreditedAttemptId : undefined;
            let studentGradeInstanceId: number | undefined;
            if (!_.isNil(workbookId) && !_.isNil(grade.gradeInstances)) {
                studentGradeInstanceId = workbooks[workbookId].studentGradeInstanceId;
            }

            logger.debug('GradeInfoHeader: Setting local info from new grade object.');
            setInfo({
                legalScore: grade.legalScore,
                overallBestScore: grade.overallBestScore,
                partialCreditBestScore: grade.partialCreditBestScore,
                effectiveScore: grade.effectiveScore,
                workbookId,
                studentGradeId: grade.id,
                studentGradeInstanceId,
                attemptsCount: currentAttemptsCount,
                averageScore: currentAverageScore,
                versionMap: currentVersionMap,
                // workbookList: currentWorkbookList,
            });
        } else {
            // this should not be a warning -- grade.id is initially null...
            // logger.warn(`GradeInfoHeader: Student grade has not been set for this combination of user (${selected.user?.id}) and problem (${selected.problem?.id}).`);
        }
    }, [grade?.id]);

    useEffect(() => {
        logger.debug('GradeInfoHeader: setting new problem state from updated Workbook ID or Grade Instance ID');
        const newProblemState: ProblemState = {};
        const currentGrade = (grade) ? grade : undefined;

        if (_.isNil(grade)) {
            // no grade for this user/problem combo -> error
            logger.error(`GradeInfoHeader: No grade for this combination of user (${selected.user?.id}) and problem (${selected.problem?.id}).`);
        } else if (_.isNil(grade.workbooks) && (_.isNil(grade.gradeInstances) || _.isEmpty(grade.gradeInstances))) {
            // no workbooks on an exam, so get previewPath and previewSeed because there cannot be a current state
            newProblemState.previewPath = selected.problem?.path;
            newProblemState.previewSeed = grade.randomSeed;
        } else if (_.isNil(grade.workbooks) || _.isNil(info.workbookId)) {
            // no workbooks, or none selected -> use currentProblemState (need version info if an exam... grade instance ID will not suffice)
            if (!_.isNil(info.studentGradeInstanceId) && !_.isNil(grade.gradeInstances) && !_.isEmpty(grade.gradeInstances)) {
                newProblemState.studentTopicAssessmentInfoId = _.find(grade.gradeInstances, ['id', info.studentGradeInstanceId])?.studentTopicAssessmentInfoId;
            }
        } else if (_.isNil(grade.workbooks[info.workbookId])) {
            // we have workbooks, and one is selected, but entry doesn't exist -> error
            logger.error(`GradeInfoHeader: User #${selected.user?.id} tried to set workbook #${info.workbookId} for problem #${selected.problem?.id} but I cannot find that record.`);
        } else { 
            newProblemState.workbookId = info.workbookId;
        }

        const newGradeInstance = (info.studentGradeInstanceId) ? _.find(grade?.gradeInstances, ['id', info.studentGradeInstanceId]) : undefined;
        logger.debug('GradeInfoHeader: setting new selected grades', newProblemState, newGradeInstance);
        setSelected(selected => ({ ...selected, problemState: newProblemState, grade: currentGrade, gradeInstance: newGradeInstance }));
    }, [info.workbookId, info.studentGradeId, info.studentGradeInstanceId]);

    const fetchTopicGrade = async () => {
        setTopicGrade(null);
        if (_.isNil(topic)) {
            logger.debug('GradeInfoHeader: topic id is nil, skipping grades call');
        }

        const params = {
            topicId: topic.id,
            userId: selected.user?.id // check selected.user not nil?
        };
        const result = await getGrades(params);
        setTopicGrade(result.data.data.first?.average ?? null);
    };
    useEffect(() => {
        logger.debug('GradeInfoHeader: there has been a change in user or topic, fetching new topic grade.');
        fetchTopicGrade();
    }, [selected.user, topic]);

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

    const versionList = (vMap: Record<number, Array<number>>) => {
        const versions: WorkbookOption[] = [];
        const versionKeys = _.keys(vMap).map((v) =>  { return parseInt(v, 10); }).sort();
        versionKeys.forEach((key, i) => {
            versions.push({ label: `Version #${i+1}`, value: key});
        });
        return versions;
    };

    const versionSubList = (vMap: Record<number, Array<number>>, versionKey: number) => {
        const attempts: WorkbookOption[] = [{ label: 'current', value: -1 }];
        vMap[versionKey].sort().forEach((id, index) => {
            attempts.push({ label: `Attempt #${index+1}`, value: id});
        });
        return attempts;
    };

    // const workbookList = (vMap: Record<number, Array<number>>, versioned: boolean) => {
    //     const options: WorkbookOption[] = [];
    //     const versionKeys = _.keys(vMap).map((v) => { return parseInt(v, 10); }).sort();
    //     versionKeys.forEach((key, i) => {
    //         let prefix = '';
    //         if (versioned) prefix = `Version #${(i + 1)} - `;
    //         vMap[key].sort().forEach((v, i) => {
    //             const value = v;
    //             const label = prefix + `Attempt #${(i + 1)}`;
    //             options.push({ label, value });
    //         });
    //     });
    //     return options;
    // };

    type Props = {
        versionMap: Record<number, Array<number>>;
        versionKey?: number;
        attemptKey: number;
        onChange: (s: typeof info) => void;
    };

    function WorkbookSelect<T extends KeyType>(props: Props) {
        // const [version, setVersion] = useState<number>(props.versionKey);
        // const [attempt, setAttempt] = useState<number>(props.attemptKey);
        function handleOnChange(e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) {
            const { value } = e.target;
            props.onChange({ ...info, workbookId: value as number });
        }
        function setAttemptsForThisVersion(e: React.ChangeEvent<{ name?: string; value: unknown; }>) {
            const { value } = e.target;
            props.onChange({...info, studentGradeInstanceId: value as number});
        }
        return (
            <FormControl className={classes.formControl}>
                {(_.keys(props.versionMap).length > 1) && // don't show unless multiple versions...
                <>
                    <InputLabel id='student-versions'>Viewing Version:</InputLabel>
                    <Select labelId='student-versions' value={props.versionKey} onChange={setAttemptsForThisVersion}>
                        {versionList(props.versionMap).map(version => (
                            <option key={version.value} value={version.value}>
                                {version.label}
                            </option>
                        ))}
                    </Select>
                </>}
                {props.versionKey &&
                <>
                    <InputLabel id='student-attempts'>Viewing Attempt:</InputLabel>
                    <Select labelId='student-attempts' value={props.attemptKey} onChange={handleOnChange}>
                        {versionSubList(props.versionMap, props.versionKey).map(attempt => (
                            <option key={attempt.value} value={attempt.value}>
                                {attempt.label}
                            </option>
                        ))}
                    </Select>
                </>}
            </FormControl>
        );
    }

    if (_.isNil(grade)) {
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
                        // disabled={(parseFloat(newScorePercentInput) / 100) === info.effectiveScore}
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
                                fetchTopicGrade();
                            }
                        }}
                    /><br />
                </>}
                {grade && grade.workbooks && !_.isEmpty(grade.workbooks) && info.workbookId && !_.isNil(grade.workbooks[info.workbookId]) &&
                    <p>
                        Score on this attempt:
                        <strong>{(grade.workbooks[info.workbookId].result * 100).toFixed(1)}</strong>
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
                    /> : 
                    `${selected.user?.name} has not attempted this problem.`
                }
            </Grid>}
        </Grid>
    );
};