import React from 'react'
import { ListGroup, ListGroupItem } from 'react-bootstrap';

interface TopicsListProps {
    listOfTopics: Array<String>;
}

/**
 * 
 * @param param0 
 */
export const TopicsList: React.FC<TopicsListProps> = ({listOfTopics}) => {
    return (
        <ListGroup>
            {listOfTopics.map((topic, i) => (
                <ListGroupItem key={`topic-${i}`}>
                    {topic}
                </ListGroupItem>
            ))}
        </ListGroup>
    );
}
export default TopicsList;