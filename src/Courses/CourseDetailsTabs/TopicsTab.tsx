import React, { useState } from 'react';
import TopicsList from '../TopicsList';
import { Accordion, Card, Row, Col, Modal } from 'react-bootstrap';
import { CourseObject, NewCourseTopicObj, UnitObject, TopicObject } from '../CourseInterfaces';
import { EditToggleButton } from '../../Components/EditToggleButton';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import { FaPlusCircle, FaTrash } from 'react-icons/fa';
import _ from 'lodash';
import TopicCreationModal from '../CourseCreation/TopicCreationModal';
import { ConfirmationModal } from '../../Components/ConfirmationModal';
import AxiosRequest from '../../Hooks/AxiosRequest';

interface TopicsTabProps {
    course: CourseObject;
    setCourse?: (course: CourseObject) => void;
}

export const TopicsTab: React.FC<TopicsTabProps> = ({ course, setCourse }) => {
    const DEFAULT_CONFIRMATION_PARAMETERS = {
        show: false,
        onConfirm: null,
        identifierText: ''
    };

    const [inEditMode, setInEditMode] = useState<boolean>(false);
    const userType: UserRole = getUserRole();

    const [showTopicCreation, setShowTopicCreation] = useState<{ show: boolean, unitIndex: number, existingTopic?: NewCourseTopicObj | undefined }>({ show: false, unitIndex: -1 });
    const [confirmationParamters, setConfirmationParamters] = useState<{ show: boolean, identifierText: string, onConfirm?: (() => unknown) | null }>(DEFAULT_CONFIRMATION_PARAMETERS);

    const showEditTopic = (e: any, unitIdentifier: number, topicIdentifier: number) => {
        console.log(`Editing topic ${topicIdentifier} in unit ${unitIdentifier}`);
        let unit = _.find(course.units, ['id', unitIdentifier]);
        console.log(unit);
        if (!unit) {
            console.error(`Cannot find unit with identifier ${unitIdentifier}`);
            return;
        }

        const topic = _.find(unit.topics, ['id', topicIdentifier]);
        if (!topic) {
            console.error(`Cannot find topic with id ${topicIdentifier} in unit with id ${unitIdentifier}`);
            return;
        }
        setShowTopicCreation({ show: true, unitIndex: unitIdentifier, existingTopic: topic });
    };

    const removeTopic = async (unitId: number, topicId: number) => {
        console.log(`removeTopic ${unitId} ${topicId}`);
        
        await AxiosRequest.delete(`/courses/topic/${topicId}`);

        let newCourse: CourseObject = { ...course };
        let unit = _.find(newCourse.units, ['id', unitId]);

        if (!unit) {
            console.error(`Could not find a unit with id ${unitId}`);
            return;
        }

        unit.topics = _.reject(unit.topics, ['id', topicId]);
        setCourse?.(newCourse);
    };

    const onTopicDeleteClicked = (e: any, unitId: number, topicId: number) => {
        setConfirmationParamters({
            show: true,
            // In the future we might want to pass something like topic name here
            identifierText: 'this topic',
            onConfirm: _.partial(removeTopic, unitId, topicId)
        });
    };

    const createTopic = async (courseUnitContentId: number) => {
        const result = await AxiosRequest.post('/courses/topic/', {
            courseUnitContentId
        });

        let newCourse: CourseObject = new CourseObject(course);
        let unit = _.find(newCourse.units, ['id', courseUnitContentId]);

        if (!unit) {
            console.error(`Could not find a unit with id ${courseUnitContentId}`);
            return;
        }

        unit.topics.push(new NewCourseTopicObj(result.data.data));
        setCourse?.(newCourse);

    };

    const addTopicClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent> | React.KeyboardEvent<HTMLSpanElement>, courseUnitContentId: number) => {
        e.stopPropagation();
        createTopic(courseUnitContentId);
    };

    const addUnit = async (courseId: number) => {
        debugger;
        try {
            const result = await AxiosRequest.post('/courses/unit', {
                courseId
            });
            let newCourse: CourseObject = new CourseObject(course);
            newCourse.units.push(new UnitObject(result.data.data));
            setCourse?.(newCourse);
        } catch (e) {
            console.error(e.response.data.message);
        }
    };

    const addUnitClick = async (_e: any, courseId: number) => {
        addUnit(courseId);
    };

    const deleteUnit = async (unitId: number) => {
        await AxiosRequest.delete(`/courses/unit/${unitId}`);
        let newCourse: CourseObject = new CourseObject(course);
        newCourse.units = _.reject(newCourse.units, ['id', unitId]);
        setCourse?.(newCourse);
    };

    const deleteUnitClick = async (e: React.MouseEvent<HTMLSpanElement, MouseEvent> | React.KeyboardEvent<HTMLSpanElement>, unitId: number) => {
        e.stopPropagation();
        setConfirmationParamters({
            show: true,
            // In the future we might want to pass something like topic name here
            identifierText: 'this unit',
            onConfirm: _.partial(deleteUnit, unitId)
        });
    };

    const addTopic = (unitIndex: number, existingTopic: NewCourseTopicObj | null | undefined, topic: NewCourseTopicObj) => {
        console.log('Adding Topic', unitIndex, existingTopic, topic);
        if (topic.questions.length <= 0) {
            // TODO: Render validation!
            console.error('Attempted to add a topic without questions!');
            return;
        }

        let newCourse: CourseObject = new CourseObject(course);
        let unit = _.find(newCourse.units, ['unique', unitIndex]);

        if (!unit) {
            console.error(`Could not find a unit with id ${unitIndex}`);
            console.log(`Could not find a unit with id ${unitIndex}`);
            return;
        }

        // If a topic already exists, update and overwrite it in the course object.
        if (existingTopic) {
            let oldTopic = _.find(unit.topics, ['unique', existingTopic.unique]);

            if (!oldTopic) {
                console.error(`Could not update topic ${existingTopic.id} in unit ${unitIndex}`);
            }

            _.assign(oldTopic, topic);
        } else {
            // Otherwise, concatenate this object onto the existing array.
            // topic.contentOrder = unit.topics.length;
            topic.contentOrder = Math.max(...unit.topics.map(topic => topic.contentOrder), 0) + 1;
            unit.topics = _.concat(unit.topics, new NewCourseTopicObj(topic));
        }

        setCourse?.(newCourse);
        setShowTopicCreation({show: false, unitIndex: -1});
    };

    return (
        <>
            <Modal
                show={showTopicCreation.show}
                onHide={() => setShowTopicCreation({ show: false, unitIndex: -1 })}
                dialogClassName="topicCreationModal"
            >
                <TopicCreationModal
                    unitIndex={showTopicCreation.unitIndex}
                    addTopic={addTopic}
                    existingTopic={showTopicCreation.existingTopic}
                />
            </Modal>
            <ConfirmationModal
                onConfirm={() => {
                    confirmationParamters.onConfirm?.();
                    setConfirmationParamters(DEFAULT_CONFIRMATION_PARAMETERS);
                }}
                onHide={() => {
                    setConfirmationParamters(DEFAULT_CONFIRMATION_PARAMETERS);
                }}
                show={confirmationParamters.show}
                headerContent={<h5>Confirm delete</h5>}
                bodyContent={`Are you sure you want to remove ${confirmationParamters.identifierText}?`}
            />
            {userType !== UserRole.STUDENT && (
                <Row>
                    <Row style={{ marginLeft: 'auto' }}>
                        {/* <span style={style} onClick={onClick} role="button" tabIndex={0} onKeyPress={onClick} > */}
                        {
                            inEditMode &&
                            <span
                                role="button"
                                tabIndex={0}
                                style={{
                                    padding: '20px'
                                }}
                                onClick={_.partial(addUnitClick, _, course.id)}
                                onKeyPress={_.partial(addUnitClick, _, course.id)}
                            >
                                <FaPlusCircle color='#00AA00' />
                            </span>
                        }
                        <EditToggleButton
                            selectedState={inEditMode}
                            onClick={() => { setInEditMode(!inEditMode); }}
                            style={{
                                padding: '20px'
                            }}
                        />
                    </Row>
                </Row>
            )}
            <h4>Units</h4>
            {course?.units?.map((unit: any) => {
                const showEditWithUnitId = _.curry(showEditTopic)(_, unit.id);
                const onTopicDeleteClickedWithUnitId = _.curry(onTopicDeleteClicked)(_, unit.id);

                return (
                    <div key={`unit${unit.id}`}>
                        <Accordion defaultActiveKey="1">
                            <Card>
                                <Accordion.Toggle as={Card.Header} eventKey="0">
                                    <Row>
                                        <Col>
                                            <h4>{unit.name}</h4>
                                        </Col>
                                        {
                                            inEditMode &&
                                            <div style={{ marginLeft: 'auto' }}>
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    style={{
                                                        padding: '6px'
                                                    }}
                                                    onClick={_.partial(deleteUnitClick, _, unit.id)}
                                                    onKeyPress={_.partial(deleteUnitClick, _, unit.id)}
                                                >
                                                    <FaTrash color='#AA0000' />
                                                </span>
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    style={{
                                                        padding: '6px'
                                                    }}
                                                    onClick={_.partial(addTopicClick, _, unit.id)}
                                                    onKeyPress={_.partial(addTopicClick, _, unit.id)}
                                                >
                                                    <FaPlusCircle color='#00AA00' />
                                                </span>
                                            </div>
                                        }
                                    </Row>
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>
                                        <TopicsList
                                            flush
                                            listOfTopics={unit.topics}
                                            showEditTopic={inEditMode ? showEditWithUnitId : undefined}
                                            removeTopic={onTopicDeleteClickedWithUnitId}
                                            unitUnique={unit.id}
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
