import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import { TopicObject, ProblemObject } from '../CourseInterfaces';
import TopicSettings from './TopicSettings';
import { ProblemSettingsViewEditPanels } from './ProblemSettingsViewEditPanels';
import BackendAPIError from '../../APIInterfaces/BackendAPI/BackendAPIError';
import { regradeTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { useGlobalSnackbarContext } from '../../Contexts/GlobalSnackbar';
import logger from '../../Utilities/Logger';
import { ConfirmationModal, ConfirmationModalProps } from '../../Components/ConfirmationModal';

interface SettingsFormProps {
    selected: TopicObject | ProblemObject;
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
    fetchTopic: () => Promise<TopicObject | null>;
}

/**
 * This component hosts the React-Hook-Forms element and passes down props to subcomponents to render the form.
 */
export const SettingsForm: React.FC<SettingsFormProps> = ({selected, setTopic, topic, setSelected, fetchTopic}) => {
    const setAlert = useGlobalSnackbarContext();
    const DEFAULT_CONFIRMATION_PARAMETERS: ConfirmationModalProps = {
        confirmText: 'Regrade Now',
        cancelText: 'Regrade Later',
        show: false,
        onConfirm: () => { logger.error('onConfirm not set'); },
        onHide: () => setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS),
        // headerContent: `Do you want to regrade this ${(() => selected instanceof TopicObject ? 'topic' : 'question')()}?`,
        headerContent: `Do you want to regrade this ${selected instanceof TopicObject ? 'topic' : 'question'}?`,
        bodyContent: <div>
            <p>Due to some of the edits made to this {selected instanceof TopicObject ? 'topic' : 'question'} some student&apos;s grade&apos;s should change.</p>
            <p>During regrade the topic will not be available to students or for updates.</p>
            <p>This should only take a few minutes.</p>
            <p>If now is not a good time you can always do this later by clicking the regrade button.</p>
        </div>
    };

    const [confirmationParameters, setConfirmationParameters] = useState<ConfirmationModalProps>(DEFAULT_CONFIRMATION_PARAMETERS);


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

    const triggerRegrade = () => setConfirmationParameters(current => ({
        ...DEFAULT_CONFIRMATION_PARAMETERS,
        show:true
    }));

    return (        
        <Grid container item md={9}>
            <ConfirmationModal
                {...confirmationParameters}
                onConfirm={() => {
                    regrade();
                    setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                }}
                onHide={() => {
                    setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                }}
                additionalModalProps={{
                    dialogClassName: 'pt-5',
                }}
            />

            {(selected instanceof TopicObject) ? (
                <TopicSettings 
                    selected={topic}
                    setTopic={setTopic}
                    triggerRegrade={triggerRegrade}
                    fetchTopic={fetchTopic}
                />
            ) : (
                <ProblemSettingsViewEditPanels
                    selected={selected}
                    setSelected={setSelected}
                    setTopic={setTopic}
                    topic={topic}
                    triggerRegrade={triggerRegrade}
                    fetchTopic={fetchTopic}
                />
            )}
        </Grid>
    );
};

export default SettingsForm;