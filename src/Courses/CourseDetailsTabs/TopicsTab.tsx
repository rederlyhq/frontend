import React, { useState } from 'react';
import TopicsList from '../TopicsList';
import { Accordion, Card, Row, Col, Modal, Alert } from 'react-bootstrap';
import { CourseObject, NewCourseTopicObj, UnitObject, TopicObject } from '../CourseInterfaces';
import { EditToggleButton } from '../../Components/EditToggleButton';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import { FaPlusCircle, FaTrash } from 'react-icons/fa';
import _ from 'lodash';
import TopicCreationModal from '../CourseCreation/TopicCreationModal';
import { ConfirmationModal } from '../../Components/ConfirmationModal';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import { putUnit, putTopic, deleteTopic, deleteUnit } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';

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
    const [error, setError] = useState<Error | null | undefined>(null);
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
        try {
            setError(null);
            await deleteTopic({
                id: topicId
            });

            let newCourse: CourseObject = { ...course };
            let unit = _.find(newCourse.units, ['id', unitId]);
    
            if (!unit) {
                console.error(`Could not find a unit with id ${unitId}`);
                return;
            }
    
            unit.topics = _.reject(unit.topics, ['id', topicId]);
            setCourse?.(newCourse);    
        } catch (e) {
            setError(e);
        }
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

    const removeUnit = async (unitId: number) => {
        try {
            setError(null);
            await deleteUnit({
                id: unitId
            });
            let newCourse: CourseObject = new CourseObject(course);
            newCourse.units = _.reject(newCourse.units, ['id', unitId]);
            setCourse?.(newCourse);
        } catch (e) {
            setError(e);
        }
    };

    const removeUnitClick = async (e: React.MouseEvent<HTMLSpanElement, MouseEvent> | React.KeyboardEvent<HTMLSpanElement>, unitId: number) => {
        e.stopPropagation();
        setConfirmationParamters({
            show: true,
            // In the future we might want to pass something like topic name here
            identifierText: 'this unit',
            onConfirm: _.partial(removeUnit, unitId)
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

    const onUnitBlur = async (event: React.FocusEvent<HTMLHeadingElement>, unitId: number) => {
        let newCourse = new CourseObject(course);
        let updatingUnit = _.find(newCourse.units, ['id', unitId]);
        if (!updatingUnit) {
            console.error(`Could not find a unit with the unique identifier ${unitId}`);
            return;
        }
        updatingUnit.name = event.target.innerText;
        await AxiosRequest.put(`/courses/unit/${unitId}`, {
            name: event.target.innerText
        });
        setCourse?.(newCourse);
    };

    const onUnitDragEnd = async (result: any) => {
        const { draggableId: unitDraggableId } = result;
        const unitIdRegex = /^unitRow(\d+)$/;
        const newContentOrder = result.destination.index + 1;
        // If exec doesn't match the result will be null
        // If it does succeed the index `1` will always be the group above
        const unitId = unitIdRegex.exec(unitDraggableId)?.[1];

        try {
            if (_.isNil(unitId)) {
                // This should not be possible
                console.error('unitId was nil when dropping');
                throw new Error('Something went wrong with drag and drop');
            }

            // TODO when should the error disappear
            setError(null);

            const newCourse = _.cloneDeep(course);
            const [removed] = newCourse.units.splice(result.source.index, 1);
            newCourse.units.splice(result.destination.index, 0, removed);
            setCourse?.(newCourse);

            const response = await putUnit({
                id: parseInt(unitId, 10),
                data: {
                    contentOrder: newContentOrder
                    // Used to test error handling
                    // contentOrder: 2147483649
                }
            });

            // The response for the put returns the updated objects, update the units from what the backend has
            response.data.data.updatesResult.forEach((returnedUnit: Partial<UnitObject>) => {
                const existingUnit = _.find(newCourse.units, ['id', returnedUnit.id]);
                Object.assign(existingUnit, returnedUnit);
            });
            setCourse?.(new CourseObject(newCourse));
        } catch (e) {
            setError(e);
            setCourse?.(course);
        }
    };

    const onTopicDragEnd = async (result: any) => {
        try {
            const { draggableId: topicDraggableId } = result;
            // Index is 0 based, while content order is 1 based
            const newContentOrder = result.destination.index + 1;
            const topicIdRegex = /^topic-(\d+)$/;
            // If exec doesn't match the result will be null
            // If it does succeed the index `1` will always be the group above
            const topicId = topicIdRegex.exec(topicDraggableId)?.[1];

            const sourceUnitDroppableId = result.source.droppableId;
            const destinationUnitDroppableId = result.destination.droppableId;

            const updates: Partial<NewCourseTopicObj> = {
                contentOrder: newContentOrder
            };
            const unitIdRegex = /^topicList-(\d+)$/;
            const destinationUnitId = unitIdRegex.exec(destinationUnitDroppableId)?.[1];
            const sourceUnitId = unitIdRegex.exec(sourceUnitDroppableId)?.[1];

            if(_.isNil(destinationUnitId)) {
                console.error('Could not parse desintationUnitId');
                return;
            }

            if(_.isNil(sourceUnitId)) {
                console.error('Could not parse sourceUnitId');
                return;
            }

            if (sourceUnitDroppableId !== destinationUnitDroppableId) {
                if(_.isNil(destinationUnitId)) {
                    console.error('destinationUnitId was somehow nil');
                    throw new Error('Something went wrong with drag and drop');
                }
                updates.courseUnitContentId = parseInt(destinationUnitId, 10);
            }

            const newCourse = _.cloneDeep(course);
            const sourceUnit = _.find(newCourse.units, ['id', parseInt(sourceUnitId, 10)]);
            const destinationUnit = sourceUnitId === destinationUnitId ? sourceUnit :_.find(newCourse.units, ['id', parseInt(destinationUnitId, 10)]);

            if(_.isNil(sourceUnit)) {
                console.error('Could not find source unit');
                return;
            }

            if(_.isNil(destinationUnit)) {
                console.error('Could not find destination unit');
                return;
            }
            const [removed] = sourceUnit.topics.splice(result.source.index, 1);
            destinationUnit.topics.splice(result.destination.index, 0, removed);

            setCourse?.(newCourse);
            setError(null);
            if (_.isNil(topicId)) {
                // This should not be possible
                console.error('topicId was nil when dropping');
                throw new Error('Something went wrong with drag and drop');
            }    
            const response = await putTopic({
                id: parseInt(topicId, 10),
                data: updates
            });

            response.data.data.updatesResult.forEach((returnedTopic: Partial<NewCourseTopicObj>) => {
                const existingUnit = _.find(newCourse.units, ['id', returnedTopic.courseUnitContentId]);
                if (_.isNil(existingUnit)) {
                    console.error('Could not find topics unit');
                    throw new Error('Drag and drop encountered an unexpected error');
                }
                const existingTopic = _.find(existingUnit.topics, ['id', returnedTopic.id]);
                Object.assign(existingTopic, returnedTopic);
            });
            setCourse?.(new CourseObject(newCourse));
        } catch (e) {
            setError(e);
            setCourse?.(course);
        }
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) {
            return;
        }
    
        if (result.destination.index === result.source.index) {
            return;
        }

        console.log('onDragEnd!', result);

        if (result.type === 'UNIT') {
            onUnitDragEnd(result);
        } else if (result.type === 'TOPIC') {
            onTopicDragEnd(result);
        } else {
            console.error(`Invalid result.type "${result.type}"`);
        }
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
                    closeModal={_.partial(setShowTopicCreation, { show: false, unitIndex: -1 })}
                    updateTopic={(topic: NewCourseTopicObj) => {
                        const existingUnit = _.find(course.units, ['id', topic.courseUnitContentId]);
                        if(_.isNil(existingUnit)) {
                            console.error('Could not find unit');
                            return;
                        }
                        const topicIndex = _.findIndex(existingUnit.topics, ['id', topic.id]);
                        if(_.isNil(topicIndex)) {
                            console.error('Could not find topic');
                            return;
                        }
                        existingUnit.topics[topicIndex] = topic;
                        setCourse?.(new CourseObject(course));
                    }}
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
            {error && <Alert variant="danger">{error.message}</Alert>}
            <h4>Units</h4>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='unitsList' type='UNIT'>
                    {
                        (provided: any) => (
                            <>
                                <div ref={provided.innerRef} style={{backgroundColor: 'white'}} {...provided.droppableProps}>
                                    {course?.units?.map((unit: any, index) => {
                                        const showEditWithUnitId = _.curry(showEditTopic)(_, unit.id);
                                        const onTopicDeleteClickedWithUnitId = _.curry(onTopicDeleteClicked)(_, unit.id);

                                        return (
                                            <Draggable draggableId={`unitRow${unit.id}`} index={index} key={`problem-row-${unit.id}`} isDragDisabled={!inEditMode}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} key={unit.id}>
                                                        <Accordion defaultActiveKey="1">
                                                            <Card>
                                                                <Accordion.Toggle as={Card.Header} eventKey="0">
                                                                    <Row>
                                                                        <Col>
                                                                            {
                                                                                // This is complaining because of the click event, however it is not a true click event, it is just stopping the accordion
                                                                                // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                                                                            } <h4
                                                                                contentEditable={inEditMode}
                                                                                suppressContentEditableWarning={true}
                                                                                className='active-editable'
                                                                                onClick={inEditMode ? ((event: React.MouseEvent<HTMLHeadingElement, MouseEvent>) => { event.stopPropagation(); }) : undefined}
                                                                                onKeyDown={(e: any) => {
                                                                                    if (e.keyCode === 13) {
                                                                                        e.preventDefault();
                                                                                        e.target.blur();
                                                                                    }
                                                                                }}
                                                                                onBlur={_.partial(onUnitBlur, _, unit.id)}
                                                                            >
                                                                                {unit.name}
                                                                            </h4>
                                                                        </Col>
                                                                        <Col />
                                                                        {
                                                                            inEditMode &&
                                                                <div style={{ marginLeft: 'auto' }}>
                                                                    <span
                                                                        role="button"
                                                                        tabIndex={0}
                                                                        style={{
                                                                            padding: '6px'
                                                                        }}
                                                                        onClick={_.partial(removeUnitClick, _, unit.id)}
                                                                        onKeyPress={_.partial(removeUnitClick, _, unit.id)}
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
                                                )}
                                            </Draggable>
                                        );
                                    })
                                    }
                                </div>
                            </>
                        )
                    }
                </ Droppable>
            </ DragDropContext>
        </>
    );
};

export default TopicsTab;
