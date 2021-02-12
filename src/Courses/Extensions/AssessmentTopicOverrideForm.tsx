import React from 'react';
import { TopicObject } from '../CourseInterfaces';
import _ from 'lodash';
import { Grid, TextField } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';

interface AssessmentTopicOverrideFormProps {
    topic: TopicObject;
}

export const AssessmentTopicOverrideForm: React.FC<AssessmentTopicOverrideFormProps> = ({topic}) => {
    const { register } = useFormContext();
    const { topicAssessmentInfo } = topic;

    if (_.isNil(topicAssessmentInfo)) {
        return null;
    }

    const md = 12;

    return (
        <>
            <Grid item md={md}>
                <TextField
                    name="maxGradedAttemptsPerVersion"
                    inputRef={register({
                        required: true,
                        min: -1
                    })}
                    defaultValue={topicAssessmentInfo.maxGradedAttemptsPerVersion}
                    label='Submissions Per Version'
                    type='number'
                    fullWidth={true}
                />
            </Grid>
            <Grid item md={md}>
                <TextField
                    name="maxVersions"
                    inputRef={register({
                        required: true,
                        min: -1
                    })}
                    defaultValue={topicAssessmentInfo.maxVersions}
                    label='Available Versions'
                    type='number'
                    fullWidth={true}
                />
            </Grid>
            <Grid item md={md}>
                <TextField
                    name="versionDelay"
                    inputRef={register({
                        required: true,
                        min: 0 // TODO what should we make the min
                    })}
                    defaultValue={topicAssessmentInfo.versionDelay}
                    label='Delay between Versions'
                    type='number'
                    fullWidth={true}
                />
            </Grid>
            <Grid item md={md}>
                <TextField
                    name="duration"
                    inputRef={register({
                        required: true,
                        min: 2
                    })}
                    defaultValue={topicAssessmentInfo.duration}
                    label='Time Limit (minutes)'
                    type='number'
                    fullWidth={true}
                />
            </Grid>
        </>
    );
};
