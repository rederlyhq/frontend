import React from 'react';
import { FormControlLabel, Grid, Switch, TextField } from '@material-ui/core';
import _ from 'lodash';
import { maxGradedAttemptsPerRandomizationField, maxReRandomizationsField, randomizationDelayField, generateSwitchField, durationField } from './GenericFormInputs';
import { Controller } from 'react-hook-form';

interface ExamSettingsProps {
    // This is the register function from react-hook-forms.
    register: any;
    control: any;
    watch: any;
}

const examFieldNamePrefix = 'topicAssessmentInfo';

const boolFields = [
    {name: 'hardCutoff'},
    {name: 'hideHints'},
    {name: 'showItemizedResults'},
    {name: 'showTotalGradeImmediately'},
    {name: 'hideProblemsAfterFinish'},
    {name: 'randomizeOrder'},
];

export const ExamSettings: React.FC<ExamSettingsProps> = ({register, control, watch}) => {
    return (
        <Grid container item md={8} spacing={3}>
            <Grid item container md={12}><h2>Exam Settings</h2></Grid>
            <Grid container item md={12} spacing={1}>
                <Grid md={4} item>{durationField(register)}</Grid>
                <Grid md={4} item>{generateSwitchField(control, 'hardCutoff')}</Grid>
            </Grid>
            <Grid item container md={12} spacing={1}>
                <Grid md={4} item>{maxGradedAttemptsPerRandomizationField(register)}</Grid>
                <Grid md={4} item>{maxReRandomizationsField(register)}</Grid>
                <Grid md={4} item>{randomizationDelayField(register)}</Grid>
            </Grid>
            <Grid item container md={12} spacing={1}>
                <Grid md={4} item>{generateSwitchField(control, 'hideHints')}</Grid>
                <Grid md={4} item>{generateSwitchField(control, 'showItemizedResults')}</Grid>
                <Grid md={4} item>{generateSwitchField(control, 'showTotalGradeImmediately')}</Grid>
                <Grid md={4} item>{generateSwitchField(control, 'hideProblemsAfterFinish')}</Grid>
                <Grid md={4} item>{generateSwitchField(control, 'randomizeOrder')}</Grid>
            </Grid>
            <Grid container item md={6}>

            </Grid>
        </Grid>
    );
};

export default ExamSettings;