import React from 'react';
import { Grid } from '@material-ui/core';
import ProblemSettings from './ProblemSettings';
import { TopicObject, ProblemObject } from '../CourseInterfaces';
import TopicSettings from './TopicSettings';
import { ProblemSettingsViewEditPanels } from './ProblemSettingsViewEditPanels';

interface SettingsFormProps {
    selected: TopicObject | ProblemObject;
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
}

/**
 * This component hosts the React-Hook-Forms element and passes down props to subcomponents to render the form.
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({selected, setTopic, topic, setSelected}) => {
    return (        
        <Grid container item md={9}>
            {(selected instanceof TopicObject) ? (
                <TopicSettings 
                    selected={topic}
                    setTopic={setTopic}
                />
            ) : (
                <ProblemSettingsViewEditPanels
                    selected={selected}
                    setSelected={setSelected}
                    setTopic={setTopic}
                    topic={topic}
                />
            )}
        </Grid>
    );
};

export default SettingsForm;