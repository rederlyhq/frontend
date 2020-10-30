import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { ProblemObject, StudentGrade, StudentGradeDict, StudentWorkbookInterface, UserObject } from '../CourseInterfaces';
import logger from '../../Utilities/Logger';
import { Button, FormControl, Grid, InputLabel, makeStyles, Select } from '@material-ui/core';
import { OverrideGradeModal } from '../CourseDetailsTabs/OverrideGradeModal';

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
    onSuccess: React.Dispatch<React.SetStateAction<{
        id?: number, 
        override?: Partial<StudentGrade>
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
    grade,
    workbookId,
    selected,
    setSelected,
    onSuccess
}) => {
    const displayCurrentScore = useRef<string | null>(null);
    if (_.isNil(displayCurrentScore.current)) {
        displayCurrentScore.current = (grade.effectiveScore * 100).toFixed(1);
    }
    const classes = useStyles();
    const [showGradeModal, setShowGradeModal] = useState<boolean>(false);
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
        logger.debug('GIH: selectedInfo has changed my grade.', grade);
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
        logger.debug('GIH: setting workbook list: ', currentWorkbookList);
        setInfo({
            legalScore: grade.legalScore,
            overallBestScore: grade.overallBestScore,
            partialCreditBestScore: grade.partialCreditBestScore,
            effectiveScore: grade.effectiveScore,
            workbookId,
            attemptsCount: currentAttemptsCount,
            averageScore: currentAverageScore,
            versionMap: currentVersionMap,
            workbookList: currentWorkbookList,
        });
    }, [grade]);

    useEffect(() => {
        if (!_.isNil(grade.workbooks) && !_.isNil(info.workbookId) && !_.isNil(grade.workbooks[info.workbookId])) {
            const newWorkbook = grade.workbooks[info.workbookId];
            logger.debug('GIH: local "info" attempting to set new workbook: ', newWorkbook);
            setSelected(selected => ({ ...selected, workbook: newWorkbook }));
        } else {
            logger.debug('GIH: current grade.workbooks:', grade.workbooks);
            console.error(`GIH: local "info" failed to set desired workbook: ${info.workbookId} - what about "selected": ${selected.workbook?.id}?`);
        }
    }, [info.workbookId]);

    const workbookList = (vMap: Record<number, Array<number>>) => {
        const options: WorkbookOption[] = [];
        const versionKeys = _.keys(vMap).map((v) => { return parseInt(v, 10); }).sort();
        const versioned = versionKeys.length > 1;
        versionKeys.forEach((key, i) => {
            let prefix = '';
            if (versioned) prefix = `Version #${(i + 1)} - `;
            vMap[key].sort().forEach((v, i) => {
                const value = v;
                const label = prefix + `Attempt #${(i + 1)}`;
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
            props.onChange({ ...info, workbookId: value as number });
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

    return (
        <Grid container spacing={1} style={{ paddingLeft: '1rem' }}>
            <Grid item xs={6}>
                Number of attempts: <strong>{info.attemptsCount}</strong>
            </Grid>
            <Grid item xs={6}>
                Best overall score: <strong>{(info.overallBestScore * 100).toFixed(1)}</strong>
            </Grid>
            <Grid item xs={6}>
                Average score: <strong>{info.averageScore && (info.averageScore * 100).toFixed(1)}</strong>
            </Grid>
            <Grid item xs={6}>
                Score from best exam submission: <strong>{(info.legalScore * 100).toFixed(1)}</strong>
            </Grid>
            <Grid item xs={6}>
                {info.workbookList && !_.isEmpty(info.workbookList) && info.workbookId &&
                    <WorkbookSelect
                        options={info.workbookList}
                        value={info.workbookId}
                        onChange={setInfo}
                    />
                }
            </Grid>
            <Grid item xs={6}>
                Effective score for grades: <strong>{(info.effectiveScore * 100).toFixed(1)}</strong>
            </Grid>
            {grade.workbooks && !_.isEmpty(grade.workbooks) &&
                <Grid item xs={6}>
                    Score on this attempt: 
                    {(!_.isNil(info.workbookId) && !_.isNil(grade.workbooks[info.workbookId])) ?
                        <strong>{(grade.workbooks[info.workbookId].result * 100).toFixed(1)}</strong> :
                        (!_.isNil(workbookId) && !_.isNil(grade.workbooks[workbookId])) ?
                            <strong>{(grade.workbooks[workbookId].result * 100).toFixed(1)}</strong> :
                            'Something went wrong here.'
                    }
                </Grid>
            }
            <Grid item xs={_.isNil(grade.workbooks) ? 12 : 6}>
                <Button
                    variant='outlined'
                    onClick={() => setShowGradeModal(true)}
                    // disabled={(parseFloat(newScorePercentInput) / 100) === info.effectiveScore}
                >
                    Set new score for grades:
                </Button>
                <OverrideGradeModal
                    show={showGradeModal}
                    onHide={() => setShowGradeModal(false)}
                    grade={grade}
                    onSuccess={(newGrade: Partial<StudentGrade>) => {
                        if (!_.isNil(newGrade.effectiveScore)) {
                            setInfo({...info, effectiveScore: newGrade.effectiveScore});
                            onSuccess(newGrade);
                        }
                    }}
                />
                {/* <TextField
                    id="standard-number"
                    defaultValue={(info.effectiveScore * 100).toFixed(1)}
                    type="number"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    onChange={onNewScoreChange}
                /> */}
            </Grid>
        </Grid>
    );
};