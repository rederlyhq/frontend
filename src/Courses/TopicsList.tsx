import React, { useState } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Button, FormGroup, FormLabel, FormControl } from 'react-bootstrap';
import { TopicObject, NewCourseTopicObj } from './CourseInterfaces';
import { BsPencilSquare } from 'react-icons/bs';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import moment from 'moment';
import AxiosRequest from '../Hooks/AxiosRequest';
import Feedback from 'react-bootstrap/Feedback';
import { UserRole, getUserRole } from '../Enums/UserRole';
import Cookies from 'js-cookie';
import { CookieEnum } from '../Enums/CookieEnum';
import MomentUtils from '@date-io/moment';
import { DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import { useForm, Controller } from "react-hook-form";
import { DevTool } from 'react-hook-form-devtools';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

interface TopicsListProps {
    listOfTopics: Array<NewCourseTopicObj>;
    flush?: boolean;
    showEditTopic?: _.CurriedFunction2<any, number, void>;
    removeTopic?: _.CurriedFunction2<any, number, void>;
}

/**
 * Lists topics. Clicking into one will go to the problem sets.
 */
export const TopicsList: React.FC<TopicsListProps> = ({listOfTopics, flush, showEditTopic, removeTopic}) => {
    const [topicFeedback, setTopicFeedback] = useState({topicId: -1, feedback: '', variant: 'danger'});
    const userType: UserRole = getUserRole(Cookies.get(CookieEnum.USERTYPE));
    const { register, control, handleSubmit, errors } = useForm();
    
    const updateTopicField = async (topicId: number, field: keyof NewCourseTopicObj, newData: Date) => {
        console.log(`Updating Topic ${topicId} to ${field} = ${newData}`);
        try {
            const res = await AxiosRequest.put(`/courses/topic/${topicId}`, {[field]: newData});
            console.log(res);
            setTopicFeedback({topicId: topicId, feedback: res.data.message, variant: 'success'});
        } catch (e) {
            console.error(e);
            setTopicFeedback({topicId: topicId, feedback: e.message, variant: 'danger'});
        }
    };
    
    return (
        <>
            {/* This could use a debug flag. */}
            {/* <DevTool control={control} /> */}
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
                                    <MuiPickersUtilsProvider utils={MomentUtils}>
                                        <Col md={3}>
                                            {/*
                                        // @ts-ignore */}
                                            <Controller 
                                                as={DateTimePicker}
                                                control={control}
                                                name={`${topic.id}-start`}
                                                variant='inline'
                                                inputVariant='filled'
                                                label='Start date'
                                                onChange={([val]) => {
                                                    updateTopicField(topic.id, 'startDate', val.toDate());
                                                    return val;
                                                }}
                                                defaultValue={topic.startDate}
                                            />
                                        </Col>
                                        <Col md={3}>
                                            {/*
                                        // @ts-ignore */}
                                            <Controller 
                                                as={DateTimePicker}
                                                control={control}
                                                name={`${topic.id}-end`}
                                                variant='inline'
                                                label='End date'
                                                onChange={([val]) => {
                                                    console.log(val);
                                                    return val;
                                                }}
                                                onAccept={(date: MaterialUiPickersDate) => {
                                                    if (!date) return;
                                                    updateTopicField(topic.id, 'endDate', date.toDate());
                                                }}
                                                defaultValue={topic.endDate}
                                                inputVariant={moment().isAfter(topic.endDate) ? 'filled' : 'outlined'}
                                                // Below are some options that would be useful for limiting how
                                                // professors can alter topics.
                                                // disablePast={true}
                                                // minDateMessage='This topic has already closed.'
                                                // readOnly={moment().isAfter(topic.endDate)}
                                                // rules={{validate: val => {console.log(val); return true;}}}
                                                // style={{'cursor': 'not-allowed'}}
                                            />
                                        </Col>
                                    </MuiPickersUtilsProvider>
                                </>
                            )}
                        </Row>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </>
    );
};
export default TopicsList;