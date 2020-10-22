import React from 'react';
import { Grid } from '@material-ui/core';
import { MaxGradedAttemptsPerVersionField, MaxVersionsField, RandomizationDelayField, GenerateSwitchField, DurationField } from './GenericFormInputs';

interface ExamSettingsProps {
    // This is the register function from react-hook-forms.
    register: any;
    control: any;
    watch: any;
}

export const ExamSettings: React.FC<ExamSettingsProps> = ({register, control}) => {
    return (
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h2>Exam Settings</h2></Grid>
            <Grid container item md={12} spacing={1}>
                <Grid md={12} item><h4>Time Settings</h4></Grid>
                <Grid md={12} item>
                    <p>
                        Duration controls how long the test will run for. 
                        Hard Cutoff forces submissions to occur at the end date of the exam. 
                        Unsetting it will allow students to have the full duration to submit their exam.
                    </p>
                </Grid>
                <Grid md={3} item><DurationField /></Grid>
                <Grid md={3} item><GenerateSwitchField fieldName='hardCutoff' /></Grid>
            </Grid>
            <Grid item container md={12} spacing={1}>
                <Grid md={12} item><h4>Version Settings</h4></Grid>
                <Grid md={12} item>
                    <p>
                        Versions allow for students to generate new versions of the exams by shuffling problem order and random seeds.
                    </p>
                </Grid>
                <Grid md={3} item><MaxGradedAttemptsPerVersionField /></Grid>
                <Grid md={3} item><MaxVersionsField /></Grid>
                <Grid md={3} item><RandomizationDelayField /></Grid>
                <Grid md={3} item><GenerateSwitchField fieldName='randomizeOrder' /></Grid>
            </Grid>
            <Grid item container md={12} spacing={1}>
                <Grid md={12} item><h4>Post-Submission Settings</h4></Grid>
                <Grid md={12} item>
                    <p>
                        These setttings control how students can interact with the exam after they&apos;ve submitted their attempt.
                    </p>
                </Grid>
                <Grid md={3} item><GenerateSwitchField fieldName='hideHints' /></Grid>
                <Grid md={3} item><GenerateSwitchField fieldName='showItemizedResults' /></Grid>
                <Grid md={3} item><GenerateSwitchField fieldName='showTotalGradeImmediately' /></Grid>
                <Grid md={3} item><GenerateSwitchField fieldName='hideProblemsAfterFinish' /></Grid>
            </Grid>
        </Grid>
    );
};

export default ExamSettings;