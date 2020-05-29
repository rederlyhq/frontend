import React, { useEffect, useState } from 'react';
import EnterRightAnimWrapper from './EnterRightAnimWrapper';
import TopicsList from '../TopicsList';
import { Button, Col, Row, Accordion, Card, Modal } from 'react-bootstrap';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { useParams } from 'react-router-dom';
import TopicCreationModal from './TopicCreationModal';
import _ from 'lodash';
import { TopicObject } from '../CourseInterfaces';

interface CourseEditPageProps {

}

/**
 * This page requires an ICourseTemplate ID.
 * Editing a Template Course means getting all details from that template, but saving
 * to a new row.
 */
export const CourseEditPage: React.FC<CourseEditPageProps> = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<any>(null);
    const [showTopicCreation, setShowTopicCreation] = useState<{show: boolean, unit: number}>({show: false, unit: -1});

    useEffect(() => {
        (async ()=>{
            let course = await AxiosRequest.get(`/curriculum/${courseId}`);

            console.log(course.data.data);
            setCourse(course.data.data);
        })();
    }, []);


    const callShowTopicCreation = (unit: number, e: any = null) => {
        if (e != null) {
            e.stopPropagation();
            e.preventDefault();
        }
        console.log(`showing ${unit}`);
        setShowTopicCreation({show: true, unit});
    };

    // Adds a topic to the selected unit.
    const addTopic = (unit_id: number, topic: TopicObject) => {
        let newCourse = {...course};
        console.log(newCourse);
        let unit = _.find(newCourse.units, {id: unit_id});
        console.log(newCourse.units);
        console.log(unit);
        if (!unit) {
            console.error(`Could not find a unit with id ${unit_id}`);
            return;
        }
        // TODO FIXME: A topic needs to fit the object, it is not just an array.
        unit.topics = _.concat(unit.topics, topic);
        setCourse(newCourse);
        setShowTopicCreation({show: false, unit: -1});
    };

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
                                        <Button className='float-right' onClick={(e: any) => callShowTopicCreation(unit.id, e)}>
                                            Add a Topic
                                        </Button>
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
            
            <Modal 
                show={showTopicCreation.show} 
                onHide={() => setShowTopicCreation({show: false, unit: -1})}
                dialogClassName="topicCreationModal"    
            >
                <TopicCreationModal unit={showTopicCreation.unit} addTopic={addTopic} />
            </Modal>
        </EnterRightAnimWrapper>
    );
};

export default CourseEditPage;