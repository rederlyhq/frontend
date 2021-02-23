import React from 'react';
import { TopicObject } from '../CourseInterfaces';
import { Alert } from '@material-ui/lab';

interface HasEverBeenActiveWarningProps {
    topic: TopicObject;
}

export const HasEverBeenActiveWarning: React.FC<HasEverBeenActiveWarningProps> = ({topic}) => {
    if (topic.isExam() && topic.hasEverBeenActive()) return null;

    return (
        <Alert severity='warning' variant='standard'>
            This Assessment is currently available to students. 
            Any changes to an active exam can distort scores for students who have already taken or are taking the exam, 
            so please make sure you are comfortable with this before you make any changes.
        </Alert>
    );
};
