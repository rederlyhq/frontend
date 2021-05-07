import React, { useEffect, useRef } from 'react';
import { Button,CircularProgress } from '@material-ui/core';
import { TopicObject } from '../CourseInterfaces';
import logger from '../../Utilities/Logger';

import { useGlobalSnackbarContext } from '../../Contexts/GlobalSnackbar';
import _ from 'lodash';

interface RegradeTopicButtonProps {
    topic: {
        retroStartedTime: Date | null;
        gradeIdsThatNeedRetro: number[];
    };
    saving: boolean;
    style?: React.CSSProperties;
    setTopic?: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    onRegradeClick: () => unknown;
    question?: {grades?: unknown[]};
    fetchTopic: () => Promise<unknown> | unknown;
    regradeRequiredOverride?: boolean;
}

export const RegradeTopicButton: React.FC<RegradeTopicButtonProps> = ({
    topic,
    saving,
    style,
    question,
    onRegradeClick,
    fetchTopic,
    regradeRequiredOverride,
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
                    await fetchTopic();
                    topicPollingTimeout.current = setTimeout(timeoutHandler, 15000);
                };

                topicPollingTimeout.current = setTimeout(timeoutHandler, 15000);
            }
        }
    }, [topic, setAlert, fetchTopic]);

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

    if (regradeRequiredOverride === false) {
        return null;
    }

    if (topic.retroStartedTime === null && (((question?.grades?.length ?? 1) === 0) || topic.gradeIdsThatNeedRetro.length === 0)) {
        return null;
    }

    return (<>
        <Button
            color='primary'
            variant='contained'
            disabled={topic.retroStartedTime !== null || saving}
            style={{
                backgroundColor: '#b26a00',
                ...style
            }}
            onClick={onRegradeClick}
        >
            Regrade {_.isNil(question) ? 'Topic' : 'Question'}
            { topic.retroStartedTime !== null && <CircularProgress size={24} style={{marginLeft: '1em'}}/>}
        </Button>
    </>);
};
