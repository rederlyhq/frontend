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
import { UserRole, getUserRole } from '../Enums/UserRole';
import { CheckboxHider } from '../Components/CheckboxHider';
import moment from 'moment';

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
    const { control } = useForm();
    
    const updateTopicField = async (topicId: number, field: keyof NewCourseTopicObj, newData: Date) => {
        console.log(`Updating Topic ${topicId} to ${field} = ${newData}`);
        const updates = {
            [field]: newData
        };

        try {
            const res = await AxiosRequest.put(`/courses/topic/${topicId}`, updates);
            console.log(res);
            setTopicFeedback({topicId: topicId, feedback: res.data.message, variant: 'success'});
        } catch (e) {
            console.error(e);
            setTopicFeedback({topicId: topicId, feedback: e.message, variant: 'danger'});
        }
    };

    const renderSingleTopic = (topic: NewCourseTopicObj) => (
        <div className='d-flex'>
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
                            <BsTrash />
                            Delete
                        </Button>
                    </Col>
                </>
            ) : (
                <>
                    <Link to={loc =>({pathname: `${loc.pathname}/topic/${topic.id}`, state: {problems: topic.questions}})}>
                        <h5>{topic.name}</h5>
                    </Link>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        {/*
                        // @ts-ignore */}
                        <Controller
                            style={{
                                marginLeft: 'auto'
                            }} 
                            as={DateTimePicker}
                            control={control}
                            name={`${topic.id}-start`}
                            variant='inline'
                            inputVariant='outlined'
                            label='Start date'
                            title='Start date'
                            onChange={([val]) => {
                                updateTopicField(topic.id, 'startDate', val.toDate());
                                return val;
                            }}
                            defaultValue={topic.startDate}
                            disabled={userType === UserRole.STUDENT}
                        />
                        {/*
                        // @ts-ignore */}
                        <Controller 
                            style={{
                                marginLeft: '10px'
                            }} 
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
                            inputVariant='outlined'
                            disabled={userType === UserRole.STUDENT}
                            // Below are some options that would be useful for limiting how
                            // professors can alter topics.
                            // disablePast={true}
                            // minDateMessage='This topic has already closed.'
                            // readOnly={moment().isAfter(topic.endDate)}
                            // rules={{validate: val => {console.log(val); return true;}}}
                            // style={{'cursor': 'not-allowed'}}
                        />
                        <CheckboxHider
                            style={{
                                marginLeft: '10px'
                            }}
                            labelText='Partial Credit?'
                            defaultChecked={!moment(topic.endDate).isSame(moment(topic.deadDate))}
                            onChange={(newValue: boolean) => {
                                if (!newValue) {
                                    updateTopicField(topic.id, 'deadDate', topic.endDate);
                                }
                            }}
                        >
                            {/*
                            // @ts-ignore */}
                            <Controller 
                                style={{
                                    marginLeft: '10px'
                                }} 
                                as={DateTimePicker}
                                control={control}
                                name={`${topic.id}-dead`}
                                variant='inline'
                                label='Dead date'
                                onChange={([val]) => {
                                    console.log(val);
                                    return val;
                                }}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    updateTopicField(topic.id, 'deadDate', date.toDate());
                                }}
                                defaultValue={topic.deadDate}
                                inputVariant='outlined'
                                disabled={userType === UserRole.STUDENT}
                                // Below are some options that would be useful for limiting how
                                // professors can alter topics.
                                // disablePast={true}
                                // minDateMessage='This topic has already closed.'
                                // readOnly={moment().isAfter(topic.endDate)}
                                // rules={{validate: val => {console.log(val); return true;}}}
                                // style={{'cursor': 'not-allowed'}}
                            />                            
                        </CheckboxHider>
                    </MuiPickersUtilsProvider>
                </>
            )}
        </div>
    );

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
    
    if(listOfTopics.length === 0) {
        return <p>There are no active topics in this course</p>;
    }

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
                        {listOfTopics.map((topic, index) => {
                            return (
                                <Draggable draggableId={`topic-${topic.id}`} index={index} key={`topic${topic.id}`} isDragDisabled={!showEditTopic}>
                                    {getDraggableTopic}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </ListGroup>
                )}
            </Droppable>
        </>
    );
};
export default TopicsList;