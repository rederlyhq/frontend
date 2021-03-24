import React from 'react';
import _ from 'lodash';
import { StudentGrade } from '../CourseInterfaces';
import { Grid, FormControl, InputLabel, Select, makeStyles } from '@material-ui/core';
import logger from '../../Utilities/Logger';

interface WorkbookSelectProps {
    grade: StudentGrade;
    versionMap: Record<number, Array<number> | undefined>;
    versionKey?: number;
    attemptKey: number;
    onChange: (s: any) => void;
    info: any;
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
    
    return (
        <Grid container item md={12} spacing={2}>
            {(_.keys(versionMap).length > 1) && // don't show unless multiple versions...
            <Grid item md={4}>
                <FormControl className={classes.formControl} fullWidth={true}>
                    <InputLabel id='student-versions'>Viewing Version:</InputLabel>
                    <Select labelId='student-versions' value={versionKey} onChange={setAttemptsForThisVersion} fullWidth={true}>
                        {versionList(versionMap).map(version => (
                            <option key={version.value} value={version.value}>
                                {version.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>
            </Grid>}
            {versionKey &&
            <Grid item md={4}>
                <FormControl className={classes.formControl} fullWidth={true}>
                    <InputLabel id='student-attempts'>Viewing Attempt:</InputLabel>
                    <Select labelId='student-attempts' value={attemptKey} onChange={handleOnChange} fullWidth={true}>
                        {versionSubList(versionMap, versionKey).map(attempt => (
                            <option key={attempt.value} value={attempt.value}>
                                {attempt.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>
            </Grid>}
        </Grid>
    );
};
