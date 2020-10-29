import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { ProblemObject, StudentGrade, StudentGradeDict, StudentWorkbookInterface, UserObject } from '../CourseInterfaces';
import { putQuestionGrade } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import useAlertState from '../../Hooks/useAlertState';
import logger from '../../Utilities/Logger';
import { Button, FormControl, Grid, InputLabel, makeStyles, Select, TextField } from '@material-ui/core';

enum OverrideGradePhase {
    PROMPT = 'PROMPT',
    CONFIRM = 'CONFIRM',
    LOCK = 'LOCK',
    LOCK_CONFIRM = 'LOCK_CONFIRM',
}
interface GradeInfoHeaderProps {
    grade: StudentGradeDict;
    workbookId?: number;
    selected: {
        problem?: ProblemObject,
        user?: UserObject,
        workbook?: StudentWorkbookInterface,
    };
    setSelected: React.Dispatch<React.SetStateAction<{
        problem?: ProblemObject,
        user?: UserObject,
        workbook?: StudentWorkbookInterface,
    }>>;
    onSuccess: (newGrade: Partial<StudentGrade>) => void;
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
    grade,
    workbookId,
    selected,
    setSelected,
    onSuccess
}) => {
    const displayCurrentScore = useRef<string | null>(null);
    if(_.isNil(displayCurrentScore.current)) {
        displayCurrentScore.current = (grade.effectiveScore * 100).toFixed(1);
    }
    const classes = useStyles();
    const [alertState, setAlertState] = useAlertState();
    const [overrideGradePhase, setOverrideGradePhase] = useState<OverrideGradePhase>(OverrideGradePhase.PROMPT);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [newScorePercentInput, setNewScorePercentInput] = useState<string>(displayCurrentScore.current ?? '');
    const [info, setInfo] = useState<{
        legalScore: number;
        overallBestScore: number;
        partialCreditBestScore: number;
        effectiveScore: number;
        workbookId?: number;
        averageScore?: number;
        attemptsCount?: number;
        versionMap?: Record<number, Array<number>>;
        workbookList?: WorkbookOption[];
    }>({
        legalScore: grade.legalScore,
        overallBestScore: grade.overallBestScore,
        partialCreditBestScore: grade.partialCreditBestScore,
        effectiveScore: grade.effectiveScore,
        workbookId,
    });

    useEffect(() => {
        // console.log(`GIH: selectedInfo has changed my grade. ${workbookId}`);
        const workbooks = grade.workbooks;
        let currentAttemptsCount: number | undefined;
        let currentAverageScore: number | undefined;
        let currentVersionMap: Record<number, Array<number>> = {};
        if (!_.isNil(workbooks) && !_.isEmpty(workbooks)) {
            const workbookKeys = Object.keys(workbooks);
            currentAttemptsCount = workbookKeys.length;
            currentAverageScore = _.reduce(workbooks, (sum, wb) => {
                return sum + wb.result;
            }, 0) / currentAttemptsCount;
            if (!_.isEmpty(workbookKeys) && _.hasIn(workbooks, [workbookKeys[0], 'studentGradeInstanceId'])) {
                currentVersionMap = _.reduce(workbooks, (map, wb, id) => {
                    if (!_.isNil(wb.studentGradeInstanceId)) {
                        (map[wb.studentGradeInstanceId] || (map[wb.studentGradeInstanceId] = [])).push(parseInt(id, 10));
                    }
                    return map;
                }, {} as { [k: number]: number[] });
            } else {
                // in this case, there should be only one key on currentVersionMap
                currentVersionMap = _.reduce(workbooks, (map, wb, id) => {
                    if (!_.isNil(wb.studentGradeId)) {
                        (map[wb.studentGradeId] || (map[wb.studentGradeId] = [])).push(parseInt(id, 10));
                    }
                    return map;
                }, {} as { [k: number]: number[] });
            }
        } else {
            currentAttemptsCount = 0;
            currentAverageScore = 0;
        }
        const currentWorkbookList = workbookList(currentVersionMap);
        setInfo({...info, 
            attemptsCount: currentAttemptsCount, 
            averageScore: currentAverageScore, 
            versionMap: currentVersionMap,
            workbookList: currentWorkbookList,
        });
    }, [grade]);

    useEffect(() => {
        if (!_.isNil(grade.workbooks) && !_.isNil(info.workbookId) && !_.isNil(grade.workbooks[info.workbookId])) {
            const newWorkbook = grade.workbooks[info.workbookId];
            // console.log('GIH: local "info" attempting to set new workbook: ', newWorkbook);
            setSelected({ ...selected, workbook: newWorkbook });
        } else {
            // console.log('GIH: current grade.workbooks:', grade.workbooks);
            console.error(`GIH: local "info" failed to set desired workbook: ${info.workbookId} - what about "selected": ${selected.workbook?.id}?`);
        }
    }, [info.workbookId]);

    const workbookList = (vMap: Record<number, Array<number>>) => {
        const options: WorkbookOption[] = [];
        const versionKeys = _.keys(vMap).map((v) => { return parseInt(v, 10); }).sort();
        const versioned = versionKeys.length > 1;
        versionKeys.forEach((key, i) => {
            let prefix = '';
            if (versioned) prefix = `Version #${(i+1)} - `;
            vMap[key].sort().forEach((v, i) => {
                const value = v;
                const label = prefix + `Attempt #${(i+1)}`;
                options.push({ label, value });
            });
        });
        return options;
    };

    type Props = {
        options: WorkbookOption[];
        value: number;
        onChange: (s: typeof info) => void;
    };

    function WorkbookSelect<T extends KeyType>(props: Props) {
        function handleOnChange(e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) {
            const { value } = e.target;
            props.onChange({...info, workbookId: value as number});
        }
        return (
            <FormControl className={classes.formControl}>
                <InputLabel id='student-attempts'>Currently Viewing:</InputLabel>
                <Select labelId='student-attempts' value={props.value} onChange={handleOnChange}>
                    {props.options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
            </FormControl>
        );
    }

    // const onHide = () => {
    //     displayCurrentScore.current = null;
    //     // onHideProp();
    //     // There is a small flicker while it animates that setTimeout hides
    //     setTimeout(() => {
    //         setOverrideGradePhase(OverrideGradePhase.PROMPT);
    //         setValidated(false);
    //         setLoading(false);
    //         // setNewScorePercentInput should be updated in setEffect because it value should default to the student grade
    //     });
    // };

    // const onNewScoreChange = (ev: React.ChangeEvent<HTMLInputElement>): void => setNewScorePercentInput(ev.target.value);

    // const overrideGradeSubmit = () => {
    //     const newScore = parseFloat(newScorePercentInput) / 100;
    //     if (newScore === grade.effectiveScore) {
    //         onHide();
    //     } else {
    //         setOverrideGradePhase(OverrideGradePhase.CONFIRM);
    //     }
    // };

    // const overrideGradeConfirm = async () => {
    //     setAlertState({
    //         variant: 'danger',
    //         message: ''
    //     });
    //     const newScore = parseFloat(newScorePercentInput) / 100;
    //     setLoading(true);
    //     try {
    //         if (_.isNil(grade.id)) {
    //             throw new Error('Application error: grade missing');
    //         }
    //         const result = await putQuestionGrade({
    //             id: grade.id,
    //             data: {
    //                 effectiveScore: newScore
    //             }
    //         });
    //         onSuccess(result.data.data.updatesResult.updatedRecords[0]);
    //     } catch (e) {
    //         setAlertState({
    //             variant: 'danger',
    //             message: e.message
    //         });
    //         setLoading(false);
    //         return;
    //     }
    //     setLoading(false);
    //     if (!grade.locked && newScore < grade.effectiveScore) {
    //         setOverrideGradePhase(OverrideGradePhase.LOCK);
    //     } else {
    //         onHide();
    //     }
    // };

    // const lockSubmit = () => {
    //     setOverrideGradePhase(OverrideGradePhase.LOCK_CONFIRM);
    // };

    // const lockConfirm = async () => {
    //     setLoading(true);
    //     try {
    //         if (_.isNil(grade.id)) {
    //             throw new Error('Application error: grade missing');
    //         }
    //         const result = await putQuestionGrade({
    //             id: grade.id,
    //             data: {
    //                 locked: true
    //             }
    //         });
    //         onSuccess(result.data.data.updatesResult.updatedRecords[0]);
    //     } catch (e) {
    //         setAlertState({
    //             variant: 'danger',
    //             message: e.message
    //         });
    //         setLoading(false);
    //         return;
    //     }
    //     setLoading(false);
    //     onHide();
    // };

    // const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    //     const form = event.currentTarget;
    //     event.preventDefault();

    //     if (form.checkValidity() === false) {
    //         event.stopPropagation();
    //     } else {
    //         overrideGradeSubmit();
    //     }
  
    //     setValidated(true);
    // };

    // if (_.isNil(grade.workbooks) || _.isEmpty(grade.workbooks)) {
    //     return (
    //         <Grid container spacing={1}>
    //             <Grid item xs={12}>
    //                 {selected.user?.name ?? 'This student'} has not made any attempts on this problem.
    //             </Grid>
    //         </Grid>
    //     );
    // }

    return (
        <Grid container spacing={1} style={{paddingLeft: '1rem'}}>
            <Grid item xs={6}>
                <div>Number of attempts: {info.attemptsCount} </div>
            </Grid>
            <Grid item xs={6}>
                <div>Best overall score: {(info.overallBestScore * 100).toFixed(1)}</div>
            </Grid>
            <Grid item xs={6}>
                <div>Average score: {info.averageScore && (info.averageScore * 100).toFixed(1)}</div>
            </Grid>
            <Grid item xs={6}>
                <div>Score from best exam submission: {(info.legalScore * 100).toFixed(1)}</div>
            </Grid>
            <Grid item xs={6}>
                {info.workbookList && !_.isEmpty(info.workbookList) && workbookId &&
                    <WorkbookSelect
                        options={info.workbookList}
                        value={workbookId}
                        onChange={setInfo}
                    />
                }
            </Grid>
            <Grid item xs={6}>
                <div>Effective score for grades: {(info.effectiveScore * 100).toFixed(1)}</div>
            </Grid>
            {grade.workbooks && !_.isEmpty(grade.workbooks) &&
                <Grid item xs={6}>
                    {(!_.isNil(info.workbookId) && !_.isNil(grade.workbooks[info.workbookId])) ?
                        <div>[LOCAL] Score on this attempt: {(grade.workbooks[info.workbookId].result * 100).toFixed(1)}</div> :
                        (!_.isNil(workbookId) && !_.isNil(grade.workbooks[workbookId])) ? 
                            <div>[SUPER] Score on this attempt: {(grade.workbooks[workbookId].result * 100).toFixed(1)}</div> :
                            <div>Something went wrong here.</div>
                    }
                </Grid>
            }
            <Grid item xs={_.isNil(grade.workbooks) ? 12 : 6}>
                <div>
                    <Button
                        variant='outlined'
                    >Set new score for grades:</Button> 
                    <TextField
                        id="standard-number"
                        /*label="Set grade:"*/
                        defaultValue={(info.effectiveScore*100).toFixed(1)}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    
                </div>
            </Grid>
        </Grid>
    );
};