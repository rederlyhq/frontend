import React from 'react'
import { ListGroup, ListGroupItem } from 'react-bootstrap';

interface TopicsListProps {
    listOfTopics: Array<any>;
}

/**
 * Lists topics. Clicking into one will go to the problem sets.
 */
export const TopicsList: React.FC<TopicsListProps> = ({listOfTopics}) => {
    return (
        <ListGroup>
            {listOfTopics.map(topic => (
                <ListGroupItem key={topic.topic_id}>
                    {topic.topic_name}
                </ListGroupItem>
            ))}
        </ListGroup>
    );
}
export default TopicsList;