import React, { useState, useEffect } from 'react';
import { checkRegradeTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../../Utilities/Logger';
import { RegradeTopicButton } from '../TopicSettings/RegradeTopicButton';
import { regradeTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import BackendAPIError from '../../APIInterfaces/BackendAPI/BackendAPIError';
import { useGlobalSnackbarContext } from '../../Contexts/GlobalSnackbar';
import _ from 'lodash';
import { ConfirmationModal, ConfirmationModalProps } from '../../Components/ConfirmationModal';

interface WrappedRegradeTopicButtonProps {
    saving: boolean;
    topicId: number;
    questionId?: number;
    userId?: number;
    topicTrigger?: number;
    style?: React.CSSProperties;
}

interface TopicInfo {
    retroStartedTime: Date | null;
    regradeCount: number;
    gradeIdsThatNeedRetro: number[];
}

export const WrappedRegradeTopicButton: React.FC<WrappedRegradeTopicButtonProps> = ({
    saving,
    topicId,
    questionId,
    userId,
    topicTrigger,
    style,
}: WrappedRegradeTopicButtonProps) => {
    const [topicInfo, setTopicInfo] = useState<TopicInfo | null>(null);
    const setAlert = useGlobalSnackbarContext();
    const DEFAULT_CONFIRMATION_PARAMETERS: ConfirmationModalProps = {
        confirmText: 'Regrade Now',
        cancelText: 'Regrade Later',
        show: false,
        onConfirm: () => { logger.error('onConfirm not set'); },
        onHide: () => setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS),
        // headerContent: `Do you want to regrade this ${(() => selected instanceof TopicObject ? 'topic' : 'question')()}?`,
        headerContent: `Do you want to regrade this ${_.isNil(questionId) ? 'topic' : 'question'}${_.isNil(userId) ? '' : ' for this student'}?`,
        bodyContent: <div>
            <p>Due to some of the edits made to this {_.isNil(questionId) ? 'topic' : 'question'}{_.isNil(userId) ? '' : ' this student\'s'} grade&apos;s should change.</p>
            <p>During regrade the topic will not be available to students or for updates.</p>
            <p>This should only take a few minutes.</p>
            <p>If now is not a good time you can always do this later by clicking the regrade button.</p>
        </div>
    };

    const [confirmationParameters, setConfirmationParameters] = useState<ConfirmationModalProps>(DEFAULT_CONFIRMATION_PARAMETERS);



    const fetchTopic = async (): Promise<{
        oldData: TopicInfo | null;
        newData: TopicInfo;
    } | null> => {
        try {
            const result = await checkRegradeTopic({
                id: topicId,
                questionId: questionId,
                userId: userId
            });
            const newData = result.data.data;
            setTopicInfo(currentData => {
                if (_.isEqual(newData, currentData)) {
                    return currentData;
                }
                return newData;
            });
            return {
                oldData: topicInfo,
                newData: newData
            };
        } catch (e) {
            const message = 'Failed to check regrade status';
            logger.error(message, e);
            setAlert?.({message: message, severity: 'error'});
        }
        return null;
    };

    const regrade = async () => {
        try {
            await regradeTopic({
                id: topicId,
                questionId: questionId,
                userId: userId
            });
            await fetchTopic();
        } catch (err) {
            if (BackendAPIError.isBackendAPIError(err)) {
                setAlert?.({message: err.message, severity: 'error'});
            } else {
                const message = 'Failed to start regrading';
                logger.error(message, err);
                setAlert?.({message: message, severity: 'error'});
            }
        }
    };

    useEffect(() => {
        setTopicInfo(null);
        fetchTopic();
    // This isn't used as a dependency but is just being reacted on
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId, questionId, userId]);

    useEffect(() => {
        (async () => {
            const result = await fetchTopic();
            if (result === null || result.oldData === null) {
                return;
            }
            
            if(result.newData.regradeCount > result.oldData.regradeCount) {
                setConfirmationParameters({
                    ...DEFAULT_CONFIRMATION_PARAMETERS,
                    show: true
                });
            }
        })();
    // This isn't used as a dependency but is just being reacted on
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicTrigger]);


    if (topicInfo === null) {
        return null;
    }
    return <>
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
        <RegradeTopicButton
            saving={saving}
            fetchTopic={fetchTopic}
            onRegradeClick={async () => setConfirmationParameters({
                ...DEFAULT_CONFIRMATION_PARAMETERS,
                show: true
            })}
            topic={topicInfo}
            style={{
                marginRight: '1em',
                ...style
            }}
            regradeRequiredOverride={topicInfo.regradeCount > 0}
            regradeType={_.isNil(questionId) ? 'Topic' : 'Question'}
        />
    </>;
};
