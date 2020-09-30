import React, { useState } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Button } from 'react-bootstrap';
import { NewCourseTopicObj } from './CourseInterfaces';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';
import MomentUtils from '@date-io/moment';
import { DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import { useForm, Controller } from 'react-hook-form';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { UserRole, getUserRole, getUserId } from '../Enums/UserRole';
import { CheckboxHider } from '../Components/CheckboxHider';
import moment from 'moment';
import { nameof } from '../Utilities/TypescriptUtils';

interface TopicsListProps {
    listOfTopics: Array<NewCourseTopicObj>;
    flush?: boolean;
    showEditTopic?: _.CurriedFunction2<any, number, void>;
    removeTopic?: _.CurriedFunction2<any, number, void>;
    unitUnique?: number;
}

/**
 * Lists topics. Clicking into one will go to the problem sets.
 */
export const TopicsList: React.FC<TopicsListProps> = ({listOfTopics, flush, showEditTopic, removeTopic, unitUnique}) => {
    const [topicFeedback, setTopicFeedback] = useState({topicId: -1, feedback: '', variant: 'danger'});
    const userType: UserRole = getUserRole();
    const userId: number = getUserId();
    
    const { control } = useForm();
    
    const updateTopicField = async (topic: NewCourseTopicObj, field: keyof NewCourseTopicObj, newData: Date) => {
        console.log(`Updating Topic ${topic.id} to ${field} = ${newData}`);
        const updates = {
            [field]: newData
        };

        if (field === nameof<NewCourseTopicObj>('endDate')) {
            if (moment(newData).isAfter(moment(topic.deadDate)) || moment(topic.deadDate).isSame(moment(topic.endDate))) {
                updates[nameof<NewCourseTopicObj>('deadDate')] = newData;
            }
        }

        try {
            const res = await AxiosRequest.put(`/courses/topic/${topic.id}`, updates);
            _.assign(topic, updates);
            console.log(res);
            setTopicFeedback({topicId: topic.id, feedback: res.data.message, variant: 'success'});
        } catch (e) {
            console.error(e);
            setTopicFeedback({topicId: topic.id, feedback: e.message, variant: 'danger'});
        }
    };

    const getActiveExtensions = (topic: NewCourseTopicObj): Array<any> => {
        // console.log('Getting active extensions for ', topic);
        const now = moment();
        if (_.isEmpty(topic.studentTopicOverride)) return [];

        const activeExtensions: any[] = topic.studentTopicOverride.reduce((accum, extension) => {
            if (now.isBetween(extension.startDate, extension.deadDate, 'day', '[]')) {
                accum.push(extension);
            }
            return accum;
        }, []);
        console.log('Active Extensions: ', activeExtensions, topic.name);
        return activeExtensions;
    };

    const renderSingleTopic = (topic: NewCourseTopicObj) => {
        const activeExtensions = getActiveExtensions(topic);
        return (
            <div className='d-flex'>
                {/* If we're in edit mode, show the edit topic buttons. */}
                {(showEditTopic && removeTopic) ? (
                    <>
                        <Col md={8}>
                            <Row>
                                <Col>
                                    <h5>{topic.name}</h5>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <Row style={{justifyContent: 'flex-end'}}>
                                <Button style={{alignSelf: 'flex-end', margin: '0em 1em'}} onClick={(e: any) => showEditTopic(e, topic.id)}>
                                    <BsPencilSquare/> Edit
                                </Button>
                                <Button style={{alignSelf: 'flex-end', margin: '0em 1em'}} variant='danger' onClick={(e: any) => removeTopic(e, topic.id)}>
                                    <BsTrash />
                                Delete
                                </Button>
                            </Row>
                        </Col>
                    </>
                ) : (
                    <>
                        <Row>
                            <Col>
                                <Row>
                                    <Link to={loc =>({pathname: `${loc.pathname}/topic/${topic.id}`, state: {problems: topic.questions}})}>
                                        <Col>
                                            <h5>{topic.name}</h5>
                                        </Col>
                                    </Link>
                                </Row>
                                {activeExtensions.length > 0 && (
                                    <Row>
                                        { userType !== UserRole.STUDENT ? (
                                            <Link to={loc =>({pathname: `${loc.pathname}/settings`, selectedTopic: topic.id})}>
                                                <Col>
                                                    <p style={{color: 'black', fontStyle: 'italic'}}>
                                                        This topic has {activeExtensions.length} active extension{activeExtensions.length > 1 && 's'}
                                                    </p>
                                                </Col>
                                            </Link>
                                        ) : (
                                            <>
                                                { _.find(activeExtensions, ['userId', userId]) !== undefined && (
                                                    <Col>
                                                        <p style={{color: 'black', fontStyle: 'italic'}}>
                                                            You have an extension for this topic.
                                                        </p>
                                                    </Col>
                                                )}
                                            </>
                                        )}
                                    </Row>
                                )}
                            </Col>
                        </Row>
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <DateTimePicker
                                style={{
                                    marginLeft: 'auto'
                                }} 
                                variant='inline'
                                label='Start date'
                                name={'start'}
                                value={topic.startDate}
                                onChange={()=>{}}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    updateTopicField(topic, 'startDate', date.toDate());
                                }}
                                inputVariant='outlined'
                                disabled={userType === UserRole.STUDENT}
                            />

                            <DateTimePicker
                                style={{
                                    marginLeft: '10px'
                                }} 
                                variant='inline'
                                label='End date'
                                name={'end'}
                                value={topic.endDate}
                                onChange={()=>{}}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    updateTopicField(topic, 'endDate', date.toDate());
                                }}
                                inputVariant='outlined'
                                disabled={userType === UserRole.STUDENT}
                            />
                        
                            {(userType !== UserRole.STUDENT || moment().isAfter(moment(topic.endDate))) &&
                        <CheckboxHider
                            style={{
                                marginLeft: '10px'
                            }}
                            labelText='Partial Credit?'
                            defaultChecked={!moment(topic.endDate).isSame(moment(topic.deadDate))}
                            onChange={(newValue: boolean) => {
                                if (!newValue) {
                                    updateTopicField(topic, 'deadDate', topic.endDate);
                                }
                            }}
                            showCheckbox={userType !== UserRole.STUDENT}
                        >
                            <DateTimePicker
                                style={{
                                    marginLeft: '10px'
                                }} 
                                variant='inline'
                                label='Dead date'
                                name={'end'}
                                value={topic.deadDate}
                                onChange={()=>{}}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    updateTopicField(topic, 'deadDate', date.toDate());
                                }}
                                inputVariant='outlined'
                                disabled={userType === UserRole.STUDENT}
                            />
                        </CheckboxHider>
                            }
                        </MuiPickersUtilsProvider>
                    </>
                )}
            </div>
        );};

    const getDraggableTopic = (provided: any, snapshot: any, rubric: any) => {
        if (rubric.source.index >= listOfTopics.length) {
            console.error(`Tried moving ${rubric.source.index} which exceed list length ${listOfTopics.length}`);
            return <div/>;
        }
        
        const topic = listOfTopics[rubric.source.index];

        return (
            <ListGroupItem {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                {renderSingleTopic(topic)}
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
                                    <Draggable draggableId={`topic-${topic.id}`} index={index} key={`topic${topic.id}`} isDragDisabled={!showEditTopic}>
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