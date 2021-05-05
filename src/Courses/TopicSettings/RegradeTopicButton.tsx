import React, { useEffect, useRef } from 'react';
import { Button } from '@material-ui/core';
import { TopicObject } from '../CourseInterfaces';
import logger from '../../Utilities/Logger';
import { Spinner } from 'react-bootstrap';
import { getTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { useGlobalSnackbarContext } from '../../Contexts/GlobalSnackbar';

interface RegradeTopicButtonProps {
    topic: TopicObject;
    saving: boolean;
    style?: React.CSSProperties;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    onRegradeClick: () => unknown;
}

export const RegradeTopicButton: React.FC<RegradeTopicButtonProps> = ({
    topic,
    saving,
    style,
    setTopic,
    onRegradeClick
}: RegradeTopicButtonProps) => {
    const topicPollingTimeout = useRef<NodeJS.Timeout | null>(null);
    const setAlert = useGlobalSnackbarContext();

    // topic poll effect
    useEffect(() => {
        if (topicPollingTimeout.current !== null) {
            if (topic.retroStartedTime === null) {
                logger.debug('There was a timeout but we do not need it anymore so we clear it');
                clearTimeout(topicPollingTimeout.current);
                topicPollingTimeout.current = null;
            }  else {
                logger.debug('There was a timeout but we still need it');
            }
        } else {
            if (topic.retroStartedTime === null) {
                logger.debug('There was not a timeout but we did not need it');
            } else {
                const timeoutHandler = async () => {
                    if (topic.retroStartedTime === null) {
                        // should not need clear timeout but why not :shrug:
                        // clearTimeout(topicPollingTimeout.current);
                        topicPollingTimeout.current = null;
                        return;
                    }
                    try {
                        const res = await getTopic({id: topic.id, includeQuestions: false});
                        const topicData = res.data.data;
                        
                        setTopic(currentTopic => new TopicObject({
                            ...topicData,
                            // didn't fetch questions again
                            questions: currentTopic?.questions,
                            // but did fetch assessment info since there is no toggle for it
                            // topicAssessmentInfo: currentTopic?.topicAssessmentInfo
                        }));
                    } catch (e) {
                        logger.error('Failed to check topic status', e);
                        setAlert?.({message: 'Failed to check topic status', severity: 'error'});
                    } finally {
                        topicPollingTimeout.current = setTimeout(timeoutHandler, 15000);
                    }
                };

                topicPollingTimeout.current = setTimeout(timeoutHandler, 15000);
            }
        }
    }, [topic, setTopic]);

    useEffect(() => {
        // wanted to clear the timeout on unmount but it seems to get unmounted very frequently
        return () => {
            // on unmount if there is a timeout clear it
            if (topicPollingTimeout.current !== null) {
                clearTimeout(topicPollingTimeout.current);
                topicPollingTimeout.current = null;
            }
        };
    }, []);

    if (topic.gradeIdsThatNeedRetro.length === 0) {
        return null;
    }

    return (<>
        <Button
            color='secondary'
            variant='contained'
            disabled={topic.retroStartedTime !== null || saving}
            style={style}
            onClick={onRegradeClick}
        >
            Regrade Topic
            { topic.retroStartedTime !== null && <Spinner animation='border' role='status' style={{marginLeft: '1em'}}><span className='sr-only'>Loading...</span></Spinner>}
        </Button>
    </>);
};
