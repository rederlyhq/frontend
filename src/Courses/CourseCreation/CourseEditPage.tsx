import React, { useEffect, useState } from 'react';
import EnterRightAnimWrapper from './EnterRightAnimWrapper';
import TopicsList from '../TopicsList';
import { Button, Col, Row, Accordion, Card } from 'react-bootstrap';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { useParams } from 'react-router-dom';

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
 * Editing a Template Course means getting all details from that template, but saving
 * to a new row.
 */
export const CourseEditPage: React.FC<CourseEditPageProps> = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<any>(null);

    useEffect(() => {
        (async ()=>{
            let course = await AxiosRequest.get(`/curriculum/${courseId}`);

            console.log(course.data.data);
            setCourse(course.data.data);
        })();
    }, []);

    return (
        <EnterRightAnimWrapper>
            <h1>Edit your copy of {course?.name}</h1>
            <Button className="float-right">Add a new Unit</Button>
            <h2>Textbooks:</h2>
            <ul>
                <li>Introduction to Math</li>
                <li>Math for Dummies</li>
            </ul>
            {course?.units?.map((unit: any) => (
                <div key={unit.unit_id}>
                    <Accordion defaultActiveKey="0">
                        <Card>
                            <Accordion.Toggle as={Card.Header} eventKey="0">
                                <Row>
                                    <Col>
                                        <h2>{unit.name}</h2>
                                    </Col>
                                    <Col>
                                        <Button className="float-right">Add a new Topic</Button>
                                    </Col>
                                </Row>
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="0">
                                <Card.Body>
                                    <TopicsList listOfTopics={unit.topics} flush/>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                </div>
            )
            )}
        </EnterRightAnimWrapper>
    );
};

export default CourseEditPage;