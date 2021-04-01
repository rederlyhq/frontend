import React from 'react';
import _ from 'lodash';
import { StudentGrade } from '../CourseInterfaces';
import { Grid, FormControl, InputLabel, Select, makeStyles, MenuItem, Chip, ListItemText, ListItemIcon, ListSubheader, Tooltip, Badge } from '@material-ui/core';
import logger from '../../Utilities/Logger';
import { WorkbookInfoDump } from './GradingPage';
import { Star, Attachment, Feedback } from '@material-ui/icons';

interface WorkbookSelectProps {
    grade: StudentGrade;
    versionMap: Record<number, Array<number> | undefined>;
    versionKey?: number;
    attemptKey: number;
    onChange: (s: WorkbookInfoDump) => void;
    info: WorkbookInfoDump;
}

type WorkbookOption = {
    value: number;
    label: string;
}

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export const WorkbookSelect: React.FC<WorkbookSelectProps> = ({grade, onChange, versionMap, versionKey, attemptKey, info}) => {
    const classes = useStyles();

    const versionList = (vMap: Record<number, Array<number> | undefined>): WorkbookOption[] => {
        return _(vMap).keys().map(v => parseInt(v, 10)).sort().map((key, i) =>  ({label: `Version #${i+1}`, value: key})).value().reverse();
    };

    // This could also be called the Attempt List.
    const versionSubList = (vMap: Record<number, Array<number> | undefined>, versionKey: number): WorkbookOption[] => {
        if (_.isNil(vMap[versionKey])) {
            logger.warn(`Grade Info Header: Workbook dropdown data cannot find #${versionKey} in version map.`);
            return [];
        }

        const attempts = (vMap[versionKey] ?? []).sort().map((id, index) => ({ label: `Attempt #${index + 1}`, value: id })).reverse();
        
        attempts.unshift({ label: 'current', value: -1 });
    
        return attempts;
    };

    function handleOnChange(e: React.ChangeEvent<{ name?: string | undefined; value: unknown; }>) {
        const { value } = e.target;
        const workbook = _.find(grade.workbooks, ['id', value]);
        onChange({ ...info, workbookId: value as number, workbook });
    }

    function setAttemptsForThisVersion(e: React.ChangeEvent<{ name?: string; value: unknown; }>) {
        const { value } = e.target;
        onChange({...info, studentGradeInstanceId: value as number, workbookId: -1, workbook: undefined});
    }

    const lastCreditedGradeInstance = _.find(grade.gradeInstances, instance => instance.bestVersionAttemptId === grade.lastInfluencingCreditedAttemptId);

    return (
        <Grid container item md={12}>
            <Grid container item xs={12}>
                <ListSubheader disableSticky disableGutters>
                    <h2>Submission Preview</h2>
                </ListSubheader>
            </Grid>
            <Grid container item xs={12} spacing={2}>
                {(_.keys(versionMap).length > 1) && // don't show unless multiple versions...
                <Grid item md={4}>
                    <FormControl className={classes.formControl} fullWidth={true}>
                        <InputLabel id='student-versions'>Viewing Version:</InputLabel>
                        <Select labelId='student-versions' value={versionKey} onChange={setAttemptsForThisVersion} fullWidth={false} SelectDisplayProps={{style: {display: 'flex', alignItems: 'center', paddingLeft: '10px', paddingRight: '30px'}}}>
                            {versionList(versionMap).map(version => {
                                const currGradeInstance = _.find(grade.gradeInstances, curr => curr.id === version.value);
                                const hasFeedback = _.some(grade.workbooks, workbook => workbook.feedback && workbook.studentGradeInstanceId === version.value);

                                return (
                                    <MenuItem key={version.value} value={version.value}>
                                        <ListItemText primary={version.label} />
                                        {currGradeInstance?.problemAttachments && currGradeInstance.problemAttachments.length > 0 && <Tooltip title={`${currGradeInstance.problemAttachments.length} Attachments`}>
                                            <Badge badgeContent={currGradeInstance.problemAttachments.length} color="primary" style={{marginRight: '10px'}}>
                                                <Attachment />
                                            </Badge>
                                        </Tooltip>}
                                        {hasFeedback && <Tooltip title='Feedback Available'><Feedback htmlColor='blue' /></Tooltip>}
                                        {lastCreditedGradeInstance?.id === version.value && <Tooltip title='Best Attempt'><Star htmlColor='orange' /></Tooltip>}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>}
                {versionKey &&
                <Grid item md={4}>
                    <FormControl className={classes.formControl} fullWidth={true}>
                        <InputLabel id='student-attempts'>Viewing Attempt:</InputLabel>
                        <Select labelId='student-attempts' value={attemptKey} onChange={handleOnChange} fullWidth={false} SelectDisplayProps={{style: {display: 'flex', alignItems: 'center', paddingLeft: '10px', paddingRight: '30px'}}}>
                            {versionSubList(versionMap, versionKey).map(attempt => (
                                <MenuItem key={attempt.value} value={attempt.value} divider>
                                    <ListItemText primary={attempt.label} />
                                    {/* <ListItemIcon> */}
                                    {_.find(grade.workbooks, ['id', attempt.value])?.feedback && <Tooltip title='Attempt has Feedback'><Feedback htmlColor='blue' /></Tooltip>}
                                    {grade.lastInfluencingCreditedAttemptId === attempt.value && <Tooltip title='Best Attempt'><Star htmlColor='orange' /></Tooltip>}
                                    {/* </ListItemIcon> */}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>}
            </Grid>
        </Grid>
    );
};
