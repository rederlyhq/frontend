import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import moment from 'moment';
import { Button, Grid } from '@material-ui/core';
import ProblemSettings from './ProblemSettings';
import { TopicTypeId } from '../../Enums/TopicType';
import { TopicSettingsInputs } from './TopicSettingsPage';
import { TopicObject, ProblemObject } from '../CourseInterfaces';
import TopicSettings from './TopicSettings';

interface SettingsFormProps {
    selected: TopicObject | ProblemObject;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
}

/**
 * This component hosts the React-Hook-Forms element and passes down props to subcomponents to render the form.
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({selected, setTopic}) => {
    return (        
        <Grid container item md={9}>
            {(selected instanceof TopicObject) ? (
                <TopicSettings 
                    selected={selected}
                    setTopic={setTopic}
                />
            ) : (
                <ProblemSettings 
                    selected={selected}
                />
            )}
        </Grid>
    );
};

export default SettingsForm;