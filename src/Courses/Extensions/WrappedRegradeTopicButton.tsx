import React, { useState, useEffect } from 'react';
import { checkRegradeTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../../Utilities/Logger';
import { RegradeTopicButton } from '../TopicSettings/RegradeTopicButton';
import { regradeTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import BackendAPIError from '../../APIInterfaces/BackendAPI/BackendAPIError';
import { useGlobalSnackbarContext } from '../../Contexts/GlobalSnackbar';

interface WrappedRegradeTopicButtonProps {
    saving: boolean;
    topicId: number;
    questionId?: number;
    userId?: number;
    topicTrigger?: number;
    style?: React.CSSProperties;
}

export const WrappedRegradeTopicButton: React.FC<WrappedRegradeTopicButtonProps> = ({
    saving,
    topicId,
    questionId,
    userId,
    topicTrigger,
    style,
}: WrappedRegradeTopicButtonProps) => {
    const [topicInfo, setTopicInfo] = useState<{
        retroStartedTime: Date | null;
        needsRegrade: boolean;
        gradeIdsThatNeedRetro: number[];
    } | null>(null);
    const setAlert = useGlobalSnackbarContext();


    const fetchTopic = async () => {
        try {
            setTopicInfo({
                retroStartedTime: null,
                needsRegrade: false,
                gradeIdsThatNeedRetro: [],
            });
            const result = await checkRegradeTopic({
                id: topicId,
                questionId: questionId,
                userId: userId
            });
            const data = result.data.data;
            setTopicInfo(data);
        } catch (e) {
            const message = 'Failed to check regrade status';
            logger.error(message, e);
            setAlert?.({message: message, severity: 'error'});
        }
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
        fetchTopic();
    }, [topicId, questionId, userId, topicTrigger]);

    if (topicInfo === null) {
        return null;
    }
    return <RegradeTopicButton
        saving={saving}
        fetchTopic={fetchTopic}
        onRegradeClick={async () => {
            await regrade();
        }}
        topic={topicInfo}
        style={{
            marginRight: '1em',
            ...style
        }}
        regradeRequiredOverride={topicInfo.needsRegrade}
    />;
};
