import React from 'react';
import TopicsList from '../TopicsList';
import { Accordion, Card, Row, Col } from 'react-bootstrap';
import { CourseObject } from '../CourseInterfaces';

interface TopicsTabProps {
    course: CourseObject;
}

export const TopicsTab: React.FC<TopicsTabProps> = ({course}) => {

    return (
        <>
            <h4>Units</h4>
            {course?.units?.map((unit: any) => {
                return (
                    <div key={unit.id}>
                        <Accordion defaultActiveKey="1">
                            <Card>
                                <Accordion.Toggle as={Card.Header} eventKey="0">
                                    <Row>
                                        <Col>
                                            <h4>{unit.name}</h4>
                                        </Col>
                                        <Col>
                                            <div>TODO: Mark unit completed?</div>
                                        </Col>
                                    </Row>
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>
                                        <TopicsList 
                                            flush
                                            listOfTopics={unit.topics}
                                        />
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                    </div>
                );
            })
            }
        </>
    );
};

export default TopicsTab;