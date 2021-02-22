import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { TopicObject } from '../../CourseInterfaces';
import _ from 'lodash';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import './TopicList.css';
import logger from '../../../Utilities/Logger';
import { SingleTopicListItem } from './SingleTopicListItem';
import { getUserRole, UserRole } from '../../../Enums/UserRole';

interface TopicsListProps {
    listOfTopics: Array<TopicObject>;
    flush?: boolean;
    removeTopic?: _.CurriedFunction2<any, number, void>;
    unitUnique?: number;
    inEditMode: boolean;
}

/**
 * Lists topics. Clicking into one will go to the problem sets.
 */
export const TopicsList: React.FC<TopicsListProps> = ({listOfTopics, flush, removeTopic, unitUnique, inEditMode}) => {
    const getDraggableTopic = (provided: any, snapshot: any, rubric: any) => {
        if (rubric.source.index >= listOfTopics.length) {
            logger.error(`Tried moving ${rubric.source.index} which exceed list length ${listOfTopics.length}`);
            return <div/>;
        }
        
        const topic = listOfTopics[rubric.source.index];

        return (
            <ListGroupItem {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} variant={(getUserRole() !== UserRole.STUDENT && topic.errors) > 0 ? 'danger' : undefined}>
                <SingleTopicListItem topic={topic} removeTopic={removeTopic} inEditMode={inEditMode}/>
            </ListGroupItem>
        );
    };


    return (
        <>
            {/* This could use a debug flag. */}
            {/* <DevTool control={control} /> */}
            <Droppable droppableId={`topicList-${unitUnique}`} renderClone={getDraggableTopic} type='TOPIC'>
                {(provided: any) => (
                    <ListGroup 
                        variant={flush ? 'flush' : undefined}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {
                            listOfTopics.length > 0 ? listOfTopics.map((topic, index) => {
                                return (
                                    <Draggable draggableId={`topic-${topic.id}`} index={index} key={`topic${topic.id}`} isDragDisabled={_.isNil(removeTopic)}>
                                        {getDraggableTopic}
                                    </Draggable>
                                );
                            }) :
                                <p>There are no active topics in this unit</p>
                        }
                        {provided.placeholder}
                    </ListGroup>
                )}
            </Droppable>
        </>
    );
};
export default TopicsList;