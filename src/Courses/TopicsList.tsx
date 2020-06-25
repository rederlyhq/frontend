import React from 'react';
import { ListGroup, ListGroupItem, Row, Col, Button, FormGroup, FormLabel, FormControl } from 'react-bootstrap';
import { TopicObject, NewCourseTopicObj } from './CourseInterfaces';
import { BsPencilSquare } from 'react-icons/bs';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import moment from 'moment';
import AxiosRequest from '../Hooks/AxiosRequest';

interface TopicsListProps {
    listOfTopics: Array<NewCourseTopicObj>;
    flush?: boolean;
    showEditTopic?: _.CurriedFunction2<any, number, void>;
    removeTopic?: _.CurriedFunction2<any, number, void>;
}

const updateTopicField = async (topicId: number, field: keyof NewCourseTopicObj, newData: Date) => {
    console.log(`Updating Topic ${topicId} to ${field} = ${newData}`);
    try {
        const res = await AxiosRequest.put(`/courses/topic/${topicId}`);
        console.log(res);
    } catch (e) {
        console.error(e);
    }
};

/**
 * Lists topics. Clicking into one will go to the problem sets.
 */
export const TopicsList: React.FC<TopicsListProps> = ({listOfTopics, flush, showEditTopic, removeTopic}) => {
    return (
        <ListGroup variant={flush ? 'flush' : undefined}>
            {listOfTopics.map(topic => (
                <ListGroupItem key={topic.id}>
                    <Row>
                        {/* TODO: Hide for Professor? */}
                        {(showEditTopic && removeTopic) ? (
                            <>
                                <Col md={10}>{topic.name}</Col>
                                <Col md={1}>
                                    <Button onClick={(e: any) => showEditTopic(e, topic.id)}>
                                        <BsPencilSquare/> Edit
                                    </Button>
                                </Col>
                                <Col md={1}>
                                    <Button variant='danger' onClick={(e: any) => removeTopic(e, topic.id)}>
                                        Delete
                                    </Button>
                                </Col>
                            </>
                        ) : (
                            <>
                                <Col md={6}>
                                    <Link to={loc =>({pathname: `${loc.pathname}/${topic.id}`, state: {problems: topic.questions}})}>
                                        <h5>{topic.name}</h5>
                                    </Link>
                                </Col>
                                <Col md={3}>
                                    <FormGroup as={Col} controlId='start'>
                                        <FormLabel>
                                            Start Date:
                                        </FormLabel>
                                        <FormControl 
                                            required
                                            type='date' 
                                            onChange={(e: any) => updateTopicField(topic.id, 'startDate', e.target.value)}
                                            defaultValue={moment(topic.startDate).format('YYYY-MM-DD')}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={3}>
                                    <FormGroup as={Col} controlId='end'>
                                        <FormLabel>
                                            End Date:
                                        </FormLabel>
                                        <FormControl 
                                            required
                                            type='date' 
                                            onChange={(e: any) => updateTopicField(topic.id, 'endDate', e.target.value)}
                                            defaultValue={moment(topic.endDate).format('YYYY-MM-DD')}
                                        />
                                    </FormGroup>
                                </Col>
                            </>
                            )}
                    </Row>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};
export default TopicsList;