import React from 'react'
import { ListGroup, ListGroupItem } from 'react-bootstrap';

interface TopicsListProps {
    listOfTopics: Array<any>;
    flush?: boolean;
}

/**
 * Lists topics. Clicking into one will go to the problem sets.
 */
export const TopicsList: React.FC<TopicsListProps> = ({listOfTopics, flush}) => {
    return (
        <ListGroup variant={flush ? 'flush' : undefined}>
            {listOfTopics.map(topic => (
                <ListGroupItem key={topic.topic_id}>
                    {topic.name}
                </ListGroupItem>
            ))}
        </ListGroup>
    );
}
export default TopicsList;