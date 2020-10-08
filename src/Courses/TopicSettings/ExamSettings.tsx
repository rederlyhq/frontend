import React from 'react';
import { FormControlLabel, Grid, Switch, TextField } from '@material-ui/core';
import _ from 'lodash';

interface ExamSettingsProps {
    // This is the register function from react-hook-forms.
    register: any;
    control: any;
    watch: any;
}

interface ExamSettings {
    hardCutoff?: boolean;
    hideHints?: boolean;
    showItemizedResults?: boolean;
    showTotalGradeImmediately?: boolean;
    hideProblemsAfterFinish?: boolean;
    duration?: number;
    maxGradedAttemptsPerRandomization?: number;
    maxReRandomizations?: number;
    randomizationDelay?: number;
    randomizeOrder?: number;
}

const boolFields = [
    {name: 'hardCutoff'},
    {name: 'hideHints'},
    {name: 'showItemizedResults'},
    {name: 'showTotalGradeImmediately'},
    {name: 'hideProblemsAfterFinish'},
    {name: 'randomizeOrder'},
];

const numericFields = [
    {name: 'duration', min: 20,},
    {name: 'maxGradedAttemptsPerRandomization', min: 1,},
    {name: 'maxReRandomizations', min: 1,},
    {name: 'randomizationDelay', min: 1,},
];

export const ExamSettings: React.FC<ExamSettingsProps> = ({register, control, watch}) => {
    return (
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h1>Exam Settings</h1></Grid>
            <Grid container item md={6}>
                {boolFields.map((f: any) => (
                    <Grid item md={6} key={f.name}>
                        <FormControlLabel
                            name={f.name}
                            inputRef={register()}
                            label={_.startCase(f.name)}
                            labelPlacement='start' 
                            control={
                                <Switch color='primary'/>
                            }
                        />
                    </Grid>
                ))}
            </Grid>
            <Grid container item md={6}>
                {numericFields.map((f: any) => (
                    <Grid item md={12} key={f.name}>
                        <FormControlLabel
                            name={f.name}
                            inputRef={register()}
                            label={_.startCase(f.name)}
                            labelPlacement='start' 
                            control={
                                <TextField type='number' />
                            }
                        />
                    </Grid>
                ))}
            </Grid>
        </Grid>
    );
};

export default ExamSettings;