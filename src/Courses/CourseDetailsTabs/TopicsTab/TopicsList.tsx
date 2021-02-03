import React from 'react';
import { ListGroup, ListGroupItem, Row, Col } from 'react-bootstrap';
import { TopicObject, TopicOverride } from '../../CourseInterfaces';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import { MdWarning } from 'react-icons/md';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import MomentUtils from '@date-io/moment';
import { DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { UserRole, getUserRole, getUserId } from '../../../Enums/UserRole';
import moment from 'moment';
import { Button } from '@material-ui/core';
import './TopicList.css';
import logger from '../../../Utilities/Logger';

interface TopicsListProps {
    listOfTopics: Array<TopicObject>;
    flush?: boolean;
    removeTopic?: _.CurriedFunction2<any, number, void>;
    unitUnique?: number;
}

/**
 * Lists topics. Clicking into one will go to the problem sets.
 */
export const TopicsList: React.FC<TopicsListProps> = ({listOfTopics, flush, removeTopic, unitUnique}) => {
    const userType: UserRole = getUserRole();
    const userId: number = getUserId();

    const getActiveExtensions = (topic: TopicObject): Array<any> => {
        const now = moment();
        if (_.isEmpty(topic.studentTopicOverride)) return [];

        const activeExtensions: any[] = topic.studentTopicOverride.reduce((accum: TopicOverride[], extension) => {
            if (now.isBetween(extension.startDate, extension.deadDate, 'day', '[]')) {
                accum.push(extension);
            }
            return accum;
        }, []);

        return activeExtensions;
    };

    const renderSingleTopic = (topic: TopicObject) => {
        const activeExtensions = getActiveExtensions(topic);
        return (
            // This is the minimum size of the datepicker, hardcoded to prevent flickering between modes.
            <div className='d-flex' style={{minHeight: '56px'}}>
                {/* If we're in edit mode, show the edit topic buttons. */}
                {(removeTopic) ? (
                    <>
                        <Col xs={8} md={8}>
                            <Row>
                                <Col>
                                    <Link to={loc => ({pathname: `${loc.pathname}/topic/${topic.id}/settings`})}>
                                        <h5>
                                            {topic.name}
                                        </h5>
                                    </Link>
                                </Col>
                            </Row>
                            <Row>
                                {topic.errors > 0 && <Link to={loc => ({pathname: `${loc.pathname}/topic/${topic.id}/settings`})} style={{color: 'red'}}>
                                    <Col>
                                        <MdWarning style={{fontSize: '1.2em'}} /> 
                                        There {topic.errors === 1 ? 'is' : 'are'} {topic.errors} issue{topic.errors === 1 ? null : 's'} with this topic.
                                    </Col>
                                </Link>  }                      
                            </Row>
                        </Col>
                        <Col xs={4} md={4}>
                            <Row style={{justifyContent: 'flex-end'}}>
                                <Link to={loc =>({pathname: `${loc.pathname}/topic/${topic.id}/settings`})}>
                                    <Button 
                                        style={{ margin: '0em 1em' }}
                                        startIcon={<BsPencilSquare/>}
                                        color='primary'
                                        variant='outlined'
                                    >
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    style={{ margin: '0em 1em' }}
                                    onClick={(e: any) => removeTopic(e, topic.id)}
                                    startIcon={<BsTrash />}
                                    color='secondary'
                                    variant='outlined'
                                >
                                    Delete
                                </Button>
                            </Row>
                        </Col>
                    </>
                ) : (
                    <>
                        <Col>
                            <Row>
                                <Link to={loc =>(userType !== UserRole.STUDENT ?
                                    {pathname: `${loc.pathname}/topic/${topic.id}/grading`} :
                                    {pathname: `${loc.pathname}/topic/${topic.id}`, state: {problems: topic.questions}}
                                )}>
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
                            {topic.errors > 0 && (
                                <Row>
                                    <Link to={loc => ({pathname: `${loc.pathname}/topic/${topic.id}/settings`})} style={{color: 'red'}}>
                                        <Col>
                                            <MdWarning style={{fontSize: '1.2em'}} /> 
                                            There {topic.errors === 1 ? 'is' : 'are'} {topic.errors} issue{topic.errors === 1 ? null : 's'} with this topic.
                                        </Col>
                                    </Link>
                                </Row>
                            )
                            }
                        </Col>
                        <MuiPickersUtilsProvider utils={MomentUtils}>
                            <>
                                <DateTimePicker
                                    style={{
                                        marginLeft: 'auto'
                                    }} 
                                    variant='inline'
                                    label='Start date'
                                    name={'start'}
                                    value={topic.startDate}
                                    onChange={()=>{}}
                                    inputVariant='outlined'
                                    disabled={true}
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
                                    inputVariant='outlined'
                                    disabled={true}
                                />
                                {/* Show the Dead Date if != end, if student also now > end */}
                                {
                                    (!moment(topic.deadDate).isSame(moment(topic.endDate))) && 
                                (
                                    userType !== UserRole.STUDENT || 
                                    moment().isSameOrAfter(moment(topic.endDate))
                                ) &&
                                <DateTimePicker
                                    style={{
                                        marginLeft: '10px'
                                    }} 
                                    variant='inline'
                                    label='Dead date'
                                    name={'end'}
                                    value={topic.deadDate}
                                    onChange={()=>{}}
                                    inputVariant='outlined'
                                    disabled={true}
                                />
                                }
                            </>
                        </MuiPickersUtilsProvider>
                    </>
                )}
            </div>
        );};

    const getDraggableTopic = (provided: any, snapshot: any, rubric: any) => {
        if (rubric.source.index >= listOfTopics.length) {
            logger.error(`Tried moving ${rubric.source.index} which exceed list length ${listOfTopics.length}`);
            return <div/>;
        }
        
        const topic = listOfTopics[rubric.source.index];

        return (
            <ListGroupItem {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef} variant={topic.errors > 0 ? 'danger' : undefined}>
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
                                    <Draggable draggableId={`topic-${topic.id}`} index={index} key={`topic${topic.id}`} isDragDisabled={_.isNil(removeTopic)}>
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