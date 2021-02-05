import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { TopicObject } from '../../CourseInterfaces';
import { MdWarning } from 'react-icons/md';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { DateTimePicker } from '@material-ui/pickers';
import { UserRole, getUserRole, getUserId } from '../../../Enums/UserRole';
import moment from 'moment';
import './TopicList.css';
import logger from '../../../Utilities/Logger';
import { TopicNavButton } from './TopicNavButton';

interface SingleTopicListItemProps {
    topic: TopicObject;
    removeTopic?: _.CurriedFunction2<any, number, void>;
}

export const SingleTopicListItem: React.FC<SingleTopicListItemProps> = ({topic, removeTopic}) => {
    const userType: UserRole = getUserRole();
    const userId: number = getUserId();
    const activeExtensions = topic.getActiveExtensions();

    if (activeExtensions.length > 0) console.log(activeExtensions);

    const startDateDisplay = userType === UserRole.STUDENT && !_.isNil(activeExtensions.first) ? activeExtensions.first.startDate : topic.startDate;
    const endDateDisplay = userType === UserRole.STUDENT && !_.isNil(activeExtensions.first) ? activeExtensions.first.endDate : topic.endDate;
    const deadDateDisplay = userType === UserRole.STUDENT && !_.isNil(activeExtensions.first) ? activeExtensions.first.deadDate : topic.deadDate;

    
    // onClick={(e: any) => removeTopic(e, topic.id)}
    // startIcon={<BsTrash />}
    // <Link to={loc =>({pathname: `${loc.pathname}/topic/${topic.id}/settings`})}>
    // startIcon={<BsPencilSquare/>}

    return (
        // This is the minimum size of the datepicker, hardcoded to prevent flickering between modes.
        <div className='d-flex' style={{minHeight: '56px'}}>
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
                                <Col>
                                    <p style={{color: 'black', fontStyle: 'italic'}}>
                                        You have an extension for this topic.
                                    </p>
                                </Col>
                            </>
                        )}
                    </Row>
                )}
                {userType !== UserRole.STUDENT && topic.errors > 0 && (
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
            <Col>
                <Row>
                    <Col xs={12} lg={6}>
                        <DateTimePicker
                            style={{
                                marginLeft: 'auto'
                            }} 
                            variant='inline'
                            label='Start date'
                            name={'start'}
                            value={startDateDisplay}
                            onChange={()=>{}}
                            inputVariant='outlined'
                            disabled={true}
                        />
                    </Col>
                    <Col xs={12} lg={6}>
                        <DateTimePicker
                            variant='inline'
                            label='End date'
                            name={'end'}
                            value={endDateDisplay}
                            onChange={()=>{}}
                            inputVariant='outlined'
                            disabled={true}
                        />
                    </Col>
                </Row>
            </Col>
            {/* Show the Dead Date if != end, if student also now > end */}
            {
                (!moment(deadDateDisplay).isSame(moment(endDateDisplay))) && 
                (
                    userType !== UserRole.STUDENT || 
                    moment().isSameOrAfter(moment(endDateDisplay))
                ) &&
                <DateTimePicker
                    style={{
                        marginLeft: '10px'
                    }} 
                    variant='inline'
                    label='Partial credit date'
                    name={'dead'}
                    value={deadDateDisplay}
                    onChange={()=>{}}
                    inputVariant='outlined'
                    disabled={true}
                />
            }
            {/* I explicitly do not want this in a Col. */}
            {removeTopic && <TopicNavButton topic={topic} onDelete={removeTopic}/>}
        </div>
    );};