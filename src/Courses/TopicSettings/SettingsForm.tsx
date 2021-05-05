import React from 'react';
import { Grid } from '@material-ui/core';
import { TopicObject, ProblemObject } from '../CourseInterfaces';
import TopicSettings from './TopicSettings';
import { ProblemSettingsViewEditPanels } from './ProblemSettingsViewEditPanels';
import BackendAPIError from '../../APIInterfaces/BackendAPI/BackendAPIError';
import { regradeTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { useGlobalSnackbarContext } from '../../Contexts/GlobalSnackbar';
import logger from '../../Utilities/Logger';

interface SettingsFormProps {
    selected: TopicObject | ProblemObject;
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
    fetchTopic: () => Promise<void>;
}

/**
 * This component hosts the React-Hook-Forms element and passes down props to subcomponents to render the form.
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({selected, setTopic, topic, setSelected, fetchTopic}) => {
    const setAlert = useGlobalSnackbarContext();

    const regrade = async () => {
        try {
            const res = await regradeTopic({
                id: topic.id,
                questionId: selected instanceof ProblemObject ? selected.id : undefined
            });
            const topicData = res.data.data;

            setTopic(currentTopic => new TopicObject({
                ...topicData,
                // didn't fetch questions again
                questions: currentTopic?.questions,
                topicAssessmentInfo: currentTopic?.topicAssessmentInfo
            }));
        } catch (err) {
            if (BackendAPIError.isBackendAPIError(err)) {
                setAlert?.({message: err.message, severity: 'error'});
            } else {
                logger.error('Failed to start regrading', err);
                setAlert?.({message: 'Failed to start regrading', severity: 'error'});
            }
        }
    };

    return (        
        <Grid container item md={9}>
            {(selected instanceof TopicObject) ? (
                <TopicSettings 
                    selected={topic}
                    setTopic={setTopic}
                    regrade={regrade}
                    fetchTopic={fetchTopic}
                />
            ) : (
                <ProblemSettingsViewEditPanels
                    selected={selected}
                    setSelected={setSelected}
                    setTopic={setTopic}
                    topic={topic}
                    regrade={regrade}
                    fetchTopic={fetchTopic}
                />
            )}
        </Grid>
    );
};

export default SettingsForm;