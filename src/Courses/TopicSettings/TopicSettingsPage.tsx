import { Grid } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { ProblemObject, TopicObject, ExamSettingsFields, ExamProblemSettingsFields } from '../CourseInterfaces';
import TopicSettingsSidebar from './TopicSettingsSidebar';
import { useCourseContext } from '../CourseProvider';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import SettingsForm from './SettingsForm';
import { getTopic, postDefFile, postQuestion, putQuestion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { Moment } from 'moment';
import { TopicTypeId } from '../../Enums/TopicType';
import { useDropzone } from 'react-dropzone';
import logger from '../../Utilities/Logger';
import { useQuery } from '../../Hooks/UseQuery';
import { NamedBreadcrumbs, useBreadcrumbLookupContext } from '../../Contexts/BreadcrumbContext';

interface TopicSettingsPageProps {
    topic?: TopicObject;
}

export interface TopicSettingsInputs extends ExamSettingsFields {
    name?: string;
    startDate?: Moment;
    endDate?: Moment;
    deadDate?: Moment;
    topicTypeId?: TopicTypeId;
    partialExtend?: boolean;
}

export interface ProblemSettingsInputs extends ExamProblemSettingsFields {
    webworkQuestionPath?: string;
    maxAttempts?: number;
    weight?: number;
    optional?: boolean;
    smaEnabled?: boolean;
    additionalProblemPaths?: Array<{path: string}>;
}

export const TopicSettingsPage: React.FC<TopicSettingsPageProps> = ({topic: topicProp}) => {
    const [selected, setSelected] = useState<ProblemObject | TopicObject>(new TopicObject());
    const [topic, setTopic] = useState<TopicObject | null>(null);
    const {course} = useCourseContext();
    const { topicId: topicIdStr } = useParams<{topicId?: string}>();
    const topicId = topicProp?.id || (topicIdStr ? parseInt(topicIdStr, 10) : null);
    const queryParams = useQuery();
    const {setBreadcrumbLookup} = useBreadcrumbLookupContext();

    useEffect(()=>{
        if (!topicId) {
            logger.error('No topicId!', window.location);
            return;
        }

        (async ()=>{
            try {
                const res = await getTopic({id: topicId, includeQuestions: true});
                const topicData = res.data.data;
                setTopic(new TopicObject(topicData));
                setBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: topicData.name ?? 'Unnamed Topic'});
                setSelected(new TopicObject(topicData));
            } catch (e) {
                logger.error('Failed to load Topic', e);
            }
        })();
    }, [course]);

    // Sets the selected state when the topic is loaded to the problemId in the URL.
    useEffect(()=>{
        const problemIdStr = queryParams.get('problemId');
        if (!_.isNil(problemIdStr)) {
            const problemId = parseInt(problemIdStr, 10);
            setSelected(selected => {
                if (selected instanceof ProblemObject) {
                    return selected;
                }
                return _.find(topic?.questions, ['id', problemId]) ?? selected;
            });
        }
    }, [topic]);

    const addNewProblem = async () => {
        if (_.isNil(topicId) || _.isNil(topic)) {
            logger.error('Tried to add a new problem with no topicId');
            return;
        }

        try {
            const result = await postQuestion({
                data: {
                    courseTopicContentId: topicId
                }
            });

            const newProb = new ProblemObject(result.data.data);
            const newTopic = new TopicObject(topic);
            newTopic.questions.push(newProb);

            setTopic(newTopic);
            // Name should enver be updated here, so no need to cache.
            // setBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: newTopic.name ?? 'Unnamed Topic'});
        } catch (e) {
            logger.error('Failed to create a new problem with default settings.', e);
        }
    };

    const handleDrag = async (result: any) => {
        try {
            if (!topic) {
                logger.error('Received a drag event on a null topic.', result);
                return;
            }

            if (!result.destination) {
                return;
            }

            if (result.destination.index === result.source.index) {
                return;
            }

            const newContentOrder: number = result.destination.index + 1;
            const problemIdRegex = /^problemRow(\d+)$/;
            const { draggableId: problemDraggableId } = result;
            // If exec doesn't match the result will be null
            // If it does succeed the index `1` will always be the group above
            const problemIdStr = problemIdRegex.exec(problemDraggableId)?.[1];
            if(_.isNil(problemIdStr)) {
                logger.error('problem not found could not update backend');
                return;
            }
            const problemId = parseInt(problemIdStr, 10);

            const newTopic = new TopicObject(topic);
            const existingProblem = _.find(newTopic.questions, ['id', problemId]);

            if(_.isNil(existingProblem)) {
                logger.error('existing problem not found could not update frontend');
                return;
            }

            existingProblem.problemNumber = newContentOrder;
            const [removed] = newTopic.questions.splice(result.source.index, 1);
            newTopic.questions.splice(result.destination.index, 0, removed);

            const response = await putQuestion({
                id: problemId,
                data: {
                    problemNumber: newContentOrder,
                },
            });

            response.data.data.updatesResult.forEach((returnedProblem: Partial<ProblemObject>) => {
                const existingProblem = _.find(newTopic.questions, ['id', returnedProblem.id]);
                Object.assign(existingProblem, returnedProblem);
            });

            setTopic(newTopic);
            setSelected(selected => selected instanceof ProblemObject ? new ProblemObject({...selected}) : selected);
            // Name should enver be updated here, so no need to cache.
            // setBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: newTopic.name ?? 'Unnamed Topic'});
        } catch (e) {
            logger.error('Drag/Drop error:', e);
        }
    };

    const onDrop = useCallback(acceptedFiles => {
        (async () => {
            try {
                // setError(null);
                if (_.isNil(topic)) {
                    logger.error('existing topic is nil');
                    throw new Error('Cannot find topic you are trying to add questions to');
                }
                const res = await postDefFile({
                    acceptedFiles,
                    courseTopicId: topic.id
                });
                const newProblems = [
                    ...topic.questions,
                    ...res.data.data.newQuestions.map((question: ProblemObject) => new ProblemObject(question))
                ];
                const newTopic = new TopicObject(topic);
                newTopic.questions = newProblems;
                setTopic(newTopic);
                // Name should enver be updated here, so no need to cache.
                // setBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: newTopic.name ?? 'Unnamed Topic'});
            } catch (e) {
                // setError(e);
            }
        })();
    }, [topic]);

    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ onDrop,
        accept: '.def',
        noClick: true,
        noKeyboard: true
    });


    if (_.isNil(topic)) {
        return null;
    }

    return (
        <Grid container spacing={5} style={{maxWidth: '100%', marginLeft: '0px'}} {...getRootProps({refKey: 'innerRef'})}>
            {/* Sidebar */}
            <TopicSettingsSidebar
                topic={topic || new TopicObject()}
                selected={selected}
                setSelected={setSelected}
                addNewProblem={addNewProblem}
                handleDrag={handleDrag}
                isDragActive={isDragActive}
                getInputProps={getInputProps}
                open={open}
            />
            {/* Problem List */}
            <SettingsForm
                selected={selected}
                setSelected={setSelected}
                setTopic={setTopic}
                topic={topic}
            />
        </Grid>
    );
};

export default TopicSettingsPage;