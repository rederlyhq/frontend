import React from 'react';
import _ from 'lodash';
import { StudentGrade } from '../CourseInterfaces';
import { Grid, FormControl, InputLabel, Select, makeStyles, MenuItem, Chip, ListItemText, ListItemIcon, Menu, List } from '@material-ui/core';
import logger from '../../Utilities/Logger';
import { WorkbookInfoDump } from './GradeInfoHeader';
import { StarBorderOutlined } from '@material-ui/icons';

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
        return _(vMap).keys().map(v => parseInt(v, 10)).sort().map((key, i) =>  ({label: `Version #${i+1}`, value: key})).value();
    };

    // This could also be called the Attempt List.
    const versionSubList = (vMap: Record<number, Array<number> | undefined>, versionKey: number): WorkbookOption[] => {
        if (_.isNil(vMap[versionKey])) {
            logger.warn(`Grade Info Header: Workbook dropdown data cannot find #${versionKey} in version map.`);
            return [];
        }

        const attempts = (vMap[versionKey] ?? []).sort().map((id, index) => ({ label: `Attempt #${index + 1}`, value: id }));
        
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
        <Grid container item md={12} spacing={2}>
            {(_.keys(versionMap).length > 1) && // don't show unless multiple versions...
            <Grid item md={4}>
                <FormControl className={classes.formControl} fullWidth={true}>
                    <InputLabel id='student-versions'>Viewing Version:</InputLabel>
                    <Select labelId='student-versions' value={versionKey} onChange={setAttemptsForThisVersion} fullWidth={false} SelectDisplayProps={{style: {display: 'flex', alignItems: 'center', paddingLeft: '10px', paddingRight: '30px'}}}>
                        {versionList(versionMap).map(version => (
                            <MenuItem key={version.value} value={version.value}>
                                <ListItemText primary={version.label} />
                                {lastCreditedGradeInstance?.id === version.value && <ListItemIcon>
                                    <Chip variant="outlined" color="primary" size="small" icon={<StarBorderOutlined />} label='Best' />
                                </ListItemIcon>}
                            </MenuItem>
                        ))}
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
                                {grade.lastInfluencingCreditedAttemptId === attempt.value && <ListItemIcon>
                                    <Chip variant="outlined" color="primary" size="small" icon={<StarBorderOutlined />} label='Best' />
                                </ListItemIcon>}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>}
        </Grid>
    );
};
