import React from 'react';
import { ProblemObject, TopicTypeId, TopicObject } from '../CourseInterfaces';
import { Grid, TextField } from '@material-ui/core';
import { useFormContext } from 'react-hook-form';

interface QuestionOverrideFormProps {
    question: ProblemObject;
    topic: TopicObject;
}

export const QuestionOverrideForm: React.FC<QuestionOverrideFormProps> = ({question, topic}) => {
    const { register } = useFormContext();

    if (topic?.topicTypeId === TopicTypeId.EXAM) {
        return (<p>You cannot give extensions on a per problem basis for assessments.</p>);
    }
    return (
        <Grid item container md={12} alignItems='flex-start' justify="center">
            <Grid item md={4}>
                <TextField
                    name="maxAttempts"
                    inputRef={register({
                        required: true,
                        min: -1
                    })}
                    defaultValue={question.maxAttempts}
                    label='Max Attempts'
                    type='number'
                />
            </Grid>
        </Grid>
    );
};