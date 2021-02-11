import React from 'react';
import { TopicObject } from '../CourseInterfaces';
import _ from 'lodash';
import { Grid } from '@material-ui/core';
import { NormalTopicOverrideForm } from './NormalTopicOverrideForm';
import { AssessmentTopicOverrideForm } from './AssessmentTopicOverrideForm';

interface TopicOverrideFormProps {
    topic: TopicObject;
}

export const TopicOverrideForm: React.FC<TopicOverrideFormProps> = ({topic}) => {
    const md = _.isNil(topic.topicAssessmentInfo) ? 12 : 6;
    return (
        <>
            <Grid md={md} container item spacing={1}>
                <NormalTopicOverrideForm topic={topic} />
            </Grid>
            {
                _.isNil(topic.topicAssessmentInfo) === false &&
                    <Grid md={md} container item spacing={1}>
                        <AssessmentTopicOverrideForm topic={topic} />
                    </Grid>
            }
        </>
    );
};