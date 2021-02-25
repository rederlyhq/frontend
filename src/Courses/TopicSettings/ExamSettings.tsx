import React from 'react';
import { Grid } from '@material-ui/core';
import { MaxGradedAttemptsPerVersionField, MaxVersionsField, RandomizationDelayField, GenerateSwitchField, DurationField } from './GenericFormInputs';

interface ExamSettingsProps {
    // TODO none of these react hook forms props are actually used, should we delete them or implement them
    // This is the register function from react-hook-forms.
    register: any;
    control: any;
    watch: any;
}

export const ExamSettings: React.FC<ExamSettingsProps> = () => {
    return (
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h2>Exam Settings</h2></Grid>
            <Grid container item md={12} spacing={1}>
                <Grid md={12} item><h4>Time</h4></Grid>
                <Grid md={12} item>
                    <p>
                        The <b>time limit</b> determines the amount of time students are given to submit their answers once they begin the exam. <br/>
                        When <b>hard cut-off</b> is disabled, students will always receive the full allotment of time for their exam, regardless of when they begin. <br/>
                        If <b>hard cut-off</b> is enabled, all exams will be cut-off at the specified end time - meaning that students who start an attempt too close to the end of the exam will not receive the full allotment of time.
                    </p>
                </Grid>
                <Grid md={3} item><DurationField /></Grid>
                <Grid md={3} item><GenerateSwitchField fieldName='hardCutoff' label='Hard Cut-off' /></Grid>
            </Grid>
            <Grid item container md={12} spacing={1}>
                <Grid md={12} item><h4>Attempts & Submissions</h4></Grid>
                <Grid md={12} item>
                    <p>
                        The <b>Available Versions</b> determines how many different versions of the test that a student is allowed to take. <br/>
                        <b>Submissions per Version</b> sets the amount of times that a student may submit answers during each attempt. <br/>
                        <b>Delay between Versions</b> is the amount of time (in minutes) that students must wait between starting one attempt and beginning another attempt, if multiple attempts are provided.
                    </p>
                </Grid>
                <Grid md={3} item><MaxVersionsField /></Grid>
                <Grid md={3} item><MaxGradedAttemptsPerVersionField /></Grid>
                <Grid md={3} item><RandomizationDelayField /></Grid>
                <Grid md={3} item><GenerateSwitchField fieldName='randomizeOrder' label='Randomize Problem Order' /></Grid>
            </Grid>
            <Grid item container md={12} spacing={1}>
                <Grid md={12} item><h4>Student Grade View</h4></Grid>
                <Grid md={12} item>
                    <p>
                        These settings control how students can interact with the exam after they&apos;ve submitted their attempt.
                    </p>
                </Grid>
                {/* <Grid md={3} item><GenerateSwitchField fieldName='hideHints' label='Hide Hints' /></Grid> */}
                <Grid md={4} item><GenerateSwitchField fieldName='showItemizedResults' label='Show Problem Scores on Submission' /></Grid>
                <Grid md={4} item><GenerateSwitchField fieldName='showTotalGradeImmediately' label='Show Total Score on Submission' /></Grid>
                <Grid md={4} item><GenerateSwitchField fieldName='hideProblemsAfterFinish' label='Hide Problems from Student on Completion'/></Grid>
            </Grid>
        </Grid>
    );
};

export default ExamSettings;