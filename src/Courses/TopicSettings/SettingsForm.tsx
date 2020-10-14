import React from 'react';
import { Grid } from '@material-ui/core';
import ProblemSettings from './ProblemSettings';
import { TopicObject, ProblemObject } from '../CourseInterfaces';
import TopicSettings from './TopicSettings';

interface SettingsFormProps {
    selected: TopicObject | ProblemObject;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
}

/**
 * This component hosts the React-Hook-Forms element and passes down props to subcomponents to render the form.
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({selected, setTopic, topic}) => {
    return (        
        <Grid container item md={9} style={{overflowY: 'scroll', height: '82vh'}}>
            {(selected instanceof TopicObject) ? (
                <TopicSettings 
                    selected={selected}
                    setTopic={setTopic}
                />
            ) : (
                <ProblemSettings 
                    selected={selected}
                    setTopic={setTopic}
                    topic={topic}
                />
            )}
        </Grid>
    );
};

export default SettingsForm;