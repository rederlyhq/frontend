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
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h2>Exam Settings</h2></Grid>
            <Grid container item md={6}>
                {durationField(register)}
                {maxGradedAttemptsPerRandomizationField(register)}
                {maxReRandomizationsField(register)}
                {randomizationDelayField(register)}
                {generateSwitchField(control, 'hardCutoff')}
                {generateSwitchField(control, 'hideHints')}
                {generateSwitchField(control, 'showItemizedResults')}
                {generateSwitchField(control, 'showTotalGradeImmediately')}
                {generateSwitchField(control, 'hideProblemsAfterFinish')}
                {generateSwitchField(control, 'randomizeOrder')}
            </Grid>
            <Grid container item md={6}>

            </Grid>
        </Grid>
    );
};

export default ExamSettings;