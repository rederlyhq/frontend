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
    'hardCutoff',
    'hideHints',
    'showItemizedResults',
    'showTotalGradeImmediately',
    'hideProblemsAfterFinish',
    'randomizeOrder',
];

const numericFields = [
    'duration',
    'maxGradedAttemptsPerRandomization',
    'maxReRandomizations',
    'randomizationDelay',
];

export const ExamSettings: React.FC<ExamSettingsProps> = ({register, control, watch}) => {
    return (
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h1 style={{margin: '0 auto'}}>Exam Settings</h1></Grid>
            <Grid container item md={6}>
                {boolFields.map((f: string) => (
                    <Grid item md={6} key={f}>
                        <FormControlLabel
                            name={f}
                            inputRef={register()}
                            label={_.startCase(f)}
                            labelPlacement='start' 
                            control={
                                <Switch color='primary'/>
                            }
                        />
                    </Grid>
                ))}
            </Grid>
            <Grid container item md={6}>
                {numericFields.map((f: string) => (
                    <Grid item md={12} key={f}>
                        <FormControlLabel
                            name={f}
                            inputRef={register()}
                            label={_.startCase(f)}
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