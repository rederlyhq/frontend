import React from 'react';
import EnterRightAnimWrapper from './EnterRightAnimWrapper';
import TopicsList from '../TopicsList';
import { Button, Col, Row } from 'react-bootstrap';

interface CourseEditPageProps {

}

const mock_topics = [
    {topic_name: 'addition', topic_id: 1},
    {topic_name: 'subtraction', topic_id: 2},
    {topic_name: 'multiplication', topic_id: 3},
    {topic_name: 'english', topic_id: 4}
];
const mock_units = [
    {name: 'Unit 1', topics: mock_topics, unit_id: 1}, 
    {name: 'Unit 2', topics: mock_topics, unit_id: 2},
    {name: 'Unit 3', topics: mock_topics, unit_id: 3},
];


/**
 * This page requires an ICourseTemplate ID.
 * 
 */
export const CourseEditPage: React.FC<CourseEditPageProps> = ({}) => {

    return (
        <EnterRightAnimWrapper>
            <h1>Edit your course:</h1>
            <h1>Textbooks:</h1>
            <ul>
                <li>Introduction to Math</li>
                <li>Math for Dummies</li>
            </ul>
            <Button className="float-right">Add a new Unit</Button>
            {mock_units.map(unit => (
                <div key={unit.unit_id}>
                    <Row>
                        <Col>
                            <h2>{unit.name}</h2>
                        </Col>
                        <Col>
                            <Button className="float-right">Add a new Topic</Button>
                        </Col>
                    </Row>
                    <TopicsList listOfTopics={unit.topics} />
                </div>
            )
            )}
        </EnterRightAnimWrapper>
    );
};

export default CourseEditPage;