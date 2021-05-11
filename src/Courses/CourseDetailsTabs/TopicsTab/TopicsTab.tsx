import React, { useState } from 'react';
import TopicsList from './TopicsList';
import { Accordion, Card, Row, Col, Alert, Button } from 'react-bootstrap';
import { CourseObject, TopicObject, UnitObject } from '../../CourseInterfaces';
import { EditToggleButton } from '../../../Components/EditToggleButton';
import { UserRole, getUserRole } from '../../../Enums/UserRole';
import { FaPlusCircle } from 'react-icons/fa';
import _ from 'lodash';
import { ConfirmationModal } from '../../../Components/ConfirmationModal';
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import { putUnit, putTopic, deleteTopic, deleteUnit, postUnit, postTopic } from '../../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../../../Utilities/Logger';
import useQuerystringHelper, { QueryStringMode } from '../../../Hooks/useQuerystringHelper';
import { CourseTarballImportButton } from '../../CourseCreation/CourseTarballImportButton';
import { Backdrop, CircularProgress, Tooltip } from '@material-ui/core';
import useAlertState from '../../../Hooks/useAlertState';
import BackendAPIError from '../../../APIInterfaces/BackendAPI/BackendAPIError';
import { IconButton } from '@material-ui/core';
import { Delete, AddCircle } from '@material-ui/icons';
import { useHistory, useLocation } from 'react-router-dom';

interface CourseTarballImportWarningsProps {
    message: string;
    missingPGFileErrors: Array<string>;
    missingAssetFileErrors: Array<string>;
}

export const CourseTarballImportWarnings: React.FC<CourseTarballImportWarningsProps> = ({message, missingPGFileErrors, missingAssetFileErrors}) => (
    <div>
        {message}<br/><br/>

        {!_.isEmpty(missingPGFileErrors) && <div>
            The following problem files are missing:
            <ul>
                {missingPGFileErrors.map(message => (<li key={message}>{message}</li>))}
            </ul>
        </div>}

        {!_.isEmpty(missingAssetFileErrors) && <div>
            The following image files are missing:
            <ul>
                {missingAssetFileErrors.map(message => (<li key={message}>{message}</li>))}
            </ul>
        </div>}
    </div>
);

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

    const {getCurrentQueryStrings, updateRoute} = useQuerystringHelper();
    const [inEditMode, setInEditMode] = useState<boolean>(getUserRole() !== UserRole.STUDENT && getCurrentQueryStrings()['edit'] === 'true');
    const [alert, setAlert] = useAlertState();
    const userType: UserRole = getUserRole();

    const [confirmationParamters, setConfirmationParamters] = useState<{ show: boolean, identifierText: string, onConfirm?: (() => unknown) | null }>(DEFAULT_CONFIRMATION_PARAMETERS);
    const [loading, setLoading] = useState<boolean>(false);
    const history = useHistory();
    const location = useLocation();
    const expandedUnits = getCurrentQueryStrings()['unitId'];

    const setInEditModeWrapper = (newEditMode: boolean) => {
        let val = newEditMode;
        if (getUserRole() === UserRole.STUDENT) {
            val = false;
        }

        setInEditMode(val);
        updateRoute({
            edit: {
                val: val ? 'true' : null,
                mode: QueryStringMode.OVERWRITE,
            },
        }, true);
    };

    const removeTopic = async (unitId: number, topicId: number) => {
        try {
            setAlert({
                variant: 'info',
                message: ''
            });
            await deleteTopic({
                id: topicId
            });

            const newCourse: CourseObject = { ...course };
            const unit = _.find(newCourse.units, ['id', unitId]);

            if (!unit) {
                logger.error(`Could not find a unit with id ${unitId}`);
                return;
            }

            const deletedTopic = _.find(unit.topics, ['id', topicId]);
            // Decrement everything after
            if (!_.isNil(deletedTopic)) {
                _.filter(unit.topics, topic => topic.contentOrder > deletedTopic.contentOrder).forEach(topic => topic.contentOrder--);
            }

            unit.topics = _.reject(unit.topics, ['id', topicId]);
            setCourse?.(newCourse);
        } catch (e) {
            setAlert({
                variant: 'danger',
                message: e.message
            });
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
        try {
            setAlert({
                variant: 'info',
                message: ''
            });
            const result = await postTopic({
                data: {
                    courseUnitContentId
                }
            });

            const newCourse: CourseObject = new CourseObject(course);
            const unit = _.find(newCourse.units, ['id', courseUnitContentId]);

            if (!unit) {
                logger.error(`Could not find a unit with id ${courseUnitContentId}`);
                return;
            }

            unit.topics.push(new TopicObject(result.data.data));
            setCourse?.(newCourse);
            updateRoute({
                unitId: {
                    val: unit.id.toString(),
                    mode: QueryStringMode.APPEND_OR_IGNORE,
                },
            }, true);
            history.push(`${location.pathname}/topic/${result.data.data.id}/settings`);
        } catch (e) {
            setAlert({
                variant: 'danger',
                message: e.message
            });
        }
    };

    const addTopicClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent> | React.KeyboardEvent<HTMLSpanElement>, courseUnitContentId: number) => {
        e.stopPropagation();
        createTopic(courseUnitContentId);
    };

    const setUnitInCourse = (unit: UnitObject) => {
        const newCourse: CourseObject = new CourseObject(course);
        newCourse.units.push(unit);
        setCourse?.(newCourse);
    };

    const addUnit = async (courseId: number) => {
        try {
            setAlert({
                variant: 'info',
                message: ''
            });
            const result = await postUnit({
                data: {
                    courseId
                }
            });
            const unit = new UnitObject(result.data.data);
            setUnitInCourse(unit);
            // Force unit open on creation.
            updateRoute({
                unitId: {
                    val: unit.id.toString(),
                    mode: QueryStringMode.APPEND_OR_IGNORE,
                },
            }, true, true);
        } catch (e) {
            setAlert({
                variant: 'danger',
                message: e.message
            });
        }
    };

    const addUnitClick = async (_e: any, courseId: number) => {
        addUnit(courseId);
    };

    const removeUnit = async (unitId: number) => {
        try {
            setAlert({
                variant: 'info',
                message: ''
            });
            await deleteUnit({
                id: unitId
            });
            const newCourse: CourseObject = new CourseObject(course);
            const deletedUnit = _.find(newCourse.units, ['id', unitId]);
            // Decrement everything after
            if (!_.isNil(deletedUnit)) {
                _.filter(newCourse.units, unit => unit.contentOrder > deletedUnit.contentOrder).forEach(unit => unit.contentOrder--);
            }
            newCourse.units = _.reject(newCourse.units, ['id', unitId]);
            setCourse?.(newCourse);
        } catch (e) {
            setAlert({
                variant: 'danger',
                message: e.message
            });
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

    const onUnitBlur = async (event: React.FocusEvent<HTMLHeadingElement>, unitId: number) => {
        try {
            setAlert({
                variant: 'info',
                message: ''
            });
            const newCourse = _.cloneDeep(course);
            const updatingUnit = _.find(newCourse.units, ['id', unitId]);
            if (!updatingUnit) {
                logger.error(`Could not find a unit with the unique identifier ${unitId}`);
                return;
            }
            updatingUnit.name = event.target.innerText;
            await putUnit({
                id: unitId,
                data: {
                    name: event.target.innerText
                }
            });
            setCourse?.(newCourse);
        } catch (e) {
            setAlert({
                variant: 'danger',
                message: e.message
            });
        }
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
                logger.error('unitId was nil when dropping');
                throw new Error('Something went wrong with drag and drop');
            }

            // TODO when should the error disappear
            setAlert({
                variant: 'info',
                message: ''
            });

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
            setAlert({
                variant: 'danger',
                message: e.message
            });
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

            const updates: Partial<TopicObject> = {
                contentOrder: newContentOrder
            };
            const unitIdRegex = /^topicList-(\d+)$/;
            const destinationUnitId = unitIdRegex.exec(destinationUnitDroppableId)?.[1];
            const sourceUnitId = unitIdRegex.exec(sourceUnitDroppableId)?.[1];

            if (_.isNil(destinationUnitId)) {
                logger.error('Could not parse desintationUnitId');
                return;
            }

            if (_.isNil(sourceUnitId)) {
                logger.error('Could not parse sourceUnitId');
                return;
            }

            if (sourceUnitDroppableId !== destinationUnitDroppableId) {
                if (_.isNil(destinationUnitId)) {
                    logger.error('destinationUnitId was somehow nil');
                    throw new Error('Something went wrong with drag and drop');
                }
                updates.courseUnitContentId = parseInt(destinationUnitId, 10);
            }

            const newCourse = _.cloneDeep(course);
            const sourceUnit = _.find(newCourse.units, ['id', parseInt(sourceUnitId, 10)]);
            const destinationUnit = sourceUnitId === destinationUnitId ? sourceUnit : _.find(newCourse.units, ['id', parseInt(destinationUnitId, 10)]);

            if (_.isNil(sourceUnit)) {
                logger.error('Could not find source unit');
                return;
            }

            if (_.isNil(destinationUnit)) {
                logger.error('Could not find destination unit');
                return;
            }
            const [removed] = sourceUnit.topics.splice(result.source.index, 1);
            destinationUnit.topics.splice(result.destination.index, 0, removed);

            setCourse?.(newCourse);
            setAlert({
                variant: 'info',
                message: ''
            });
            if (_.isNil(topicId)) {
                // This should not be possible
                logger.error('topicId was nil when dropping');
                throw new Error('Something went wrong with drag and drop');
            }
            const response = await putTopic({
                id: parseInt(topicId, 10),
                data: updates
            });

            response.data.data.updatesResult.forEach((returnedTopic: Partial<TopicObject>) => {
                const existingUnit = _.find(newCourse.units, ['id', returnedTopic.courseUnitContentId]);
                if (_.isNil(existingUnit)) {
                    logger.error('Could not find topics unit');
                    throw new Error('Drag and drop encountered an unexpected error');
                }
                const existingTopic = _.find(existingUnit.topics, ['id', returnedTopic.id]);
                Object.assign(existingTopic, returnedTopic);
            });
            setCourse?.(new CourseObject(newCourse));
        } catch (e) {
            setAlert({
                variant: 'danger',
                message: e.message
            });
            setCourse?.(course);
        }
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index && result.destination.droppableId === result.source.droppableId) {
            return;
        }

        logger.info('onDragEnd!', result);

        if (result.type === 'UNIT') {
            onUnitDragEnd(result);
        } else if (result.type === 'TOPIC') {
            onTopicDragEnd(result);
        } else {
            logger.error(`Invalid result.type "${result.type}"`);
        }
    };

    return (
        <>
            <Backdrop open={loading} style={{zIndex: 99999}}><CircularProgress/></Backdrop>
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
            <Alert variant={alert.variant} show={Boolean(alert.message)}>{alert.message}</Alert>
            <div
                style={{
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    display: 'flex',
                }}
            >
                <h2>Units</h2>
                <div
                    style={{
                        marginLeft: 'auto'
                    }}
                >
                    {userType !== UserRole.STUDENT && (
                        <div style={{justifyContent: 'flex-end'}}>
                            {/* <span style={style} onClick={onClick} role="button" tabIndex={0} onKeyPress={onClick} > */}
                            {
                                inEditMode &&
                                <>
                                    <CourseTarballImportButton 
                                        style={{
                                            marginLeft: '1em'
                                        }}
                                        courseId={course.id}
                                        /* Can't deconstruct here because the type changes based on the status object (even though it has the same props) */
                                        onEvent={(event) => {
                                            // Grabbing this for error handling (see default below)
                                            const { status } = event;
                                            if (status !== 'error') {
                                                setAlert({
                                                    variant: 'info',
                                                    message: ''
                                                });
                                            }
                                            if (status !== 'loading') {
                                                setLoading(false);
                                            }
                                            switch (event.status) {
                                            case 'error':
                                                if (event.data instanceof BackendAPIError) {
                                                    const { missingPGFileErrors = [], missingAssetFileErrors = [] } = (event.data.data as {
                                                        missingPGFileErrors?: Array<string>;
                                                        missingAssetFileErrors?: Array<string>;                                                    
                                                    } | undefined) ?? {};

                                                    if (!_.isEmpty(missingPGFileErrors) || !_.isEmpty(missingAssetFileErrors)) {
                                                        setAlert({
                                                            variant: 'danger',
                                                            message: CourseTarballImportWarnings({
                                                                message: 'The course archive upload failed with the following errors:',
                                                                missingAssetFileErrors: missingAssetFileErrors,
                                                                missingPGFileErrors: missingPGFileErrors,
                                                            })
                                                        });
                                                        break;
                                                    }
                                                }
                                                setAlert({
                                                    variant: 'danger',
                                                    message: event.data.message
                                                });
                                                break;
                                            case 'success': {
                                                setUnitInCourse(event.data);
                                                if (!_.isEmpty(event.warnings.missingAssetFileErrors) || !_.isEmpty(event.warnings.missingPGFileErrors)) {
                                                    setAlert({
                                                        variant: 'warning',
                                                        message: CourseTarballImportWarnings({
                                                            message: 'The course archive uploaded successfully with the following warnings:',
                                                            missingAssetFileErrors: event.warnings.missingAssetFileErrors,
                                                            missingPGFileErrors: event.warnings.missingPGFileErrors,
                                                        })
                                                    });
                                                }
                                                break;
                                            }
                                            case 'loading':
                                                setLoading(true);
                                                break;
                                            default:
                                                // Event is never in this case so can't use event.status
                                                logger.error(`Unhandled case ${status} in tarball upload`);
                                            }
                                        }}
                                    />
                                    <Button variant='outline-success'
                                        tabIndex={0}
                                        onClick={_.partial(addUnitClick, _, course.id)}
                                        onKeyPress={_.partial(addUnitClick, _, course.id)}
                                        style={{
                                            marginLeft: '1em'
                                        }}
                                    >
                                        <FaPlusCircle /> New Unit
                                    </Button>
                                </>
                            }
                            <EditToggleButton
                                selectedState={inEditMode}
                                onClick={() => { setInEditModeWrapper(!inEditMode); }}
                                style={{
                                    padding: '0em 0em 0em 1em'
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='unitsList' type='UNIT'>
                    {
                        (provided: any) => (
                            <div ref={provided.innerRef} style={{ backgroundColor: 'white' }} {...provided.droppableProps}>
                                {course?.units?.map((unit: any, index) => {
                                    const onTopicDeleteClickedWithUnitId = _.curry(onTopicDeleteClicked)(_, unit.id);
                                    const unitId: string = unit.id.toString();
                                    return (
                                        <Draggable draggableId={`unitRow${unit.id}`} index={index} key={`problem-row-${unit.id}`} isDragDisabled={!inEditMode}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} key={unit.id}>
                                                    {/* 0 is an actual reference, which opens this accordion. 1 or any other value keeps it closed. */}
                                                    <Accordion 
                                                        defaultActiveKey={_.includes(expandedUnits, unitId) ? '0' : ''}
                                                        activeKey={_.includes(expandedUnits, unitId) ? '0' : ''}
                                                        onSelect={
                                                            ()=>{
                                                                updateRoute({
                                                                    unitId: {
                                                                        val: unitId, 
                                                                        mode: QueryStringMode.APPEND_OR_REMOVE,
                                                                    },
                                                                }, true, true);
                                                            }
                                                        }
                                                    >
                                                        <Card>
                                                            <Accordion.Toggle as={Card.Header} eventKey="0">
                                                                <Row>
                                                                    <Col xs={10} md={10} style={{alignSelf: 'center'}}>
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
                                                                            style={{
                                                                                display: 'inline',
                                                                                cursor: 'text',
                                                                                wordBreak: 'break-all',
                                                                            }}
                                                                        >
                                                                            {unit.name}
                                                                        </h4>
                                                                    </Col>
                                                                    <Col xs={2} md={2} className='d-flex' style={{alignSelf: 'center', justifyContent: 'flex-end', visibility: !inEditMode ? 'hidden' : 'inherit'}}>
                                                                        <Tooltip title='Delete Unit'>
                                                                            <IconButton 
                                                                                aria-label='Delete Unit'
                                                                                tabIndex={0}
                                                                                onClick={_.partial(removeUnitClick, _, unit.id)}
                                                                                onKeyPress={_.partial(removeUnitClick, _, unit.id)}
                                                                            >
                                                                                <Delete color='error' />
                                                                            </IconButton>
                                                                        </Tooltip>    
                                                                        <Tooltip title='New Topic'>
                                                                            <IconButton
                                                                                aria-label='New Topic'
                                                                                tabIndex={0}
                                                                                onClick={_.partial(addTopicClick, _, unit.id)}
                                                                                onKeyPress={_.partial(addTopicClick, _, unit.id)}
                                                                            >
                                                                                <AddCircle htmlColor='#28a745' />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Col>
                                                                </Row>
                                                            </Accordion.Toggle>
                                                            <Accordion.Collapse eventKey="0" mountOnEnter>
                                                                <Card.Body>
                                                                    <TopicsList
                                                                        flush
                                                                        listOfTopics={unit.topics}
                                                                        removeTopic={userType !== UserRole.STUDENT ? onTopicDeleteClickedWithUnitId : undefined}
                                                                        unitUnique={unit.id}
                                                                        inEditMode={inEditMode}
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
                        )
                    }
                </ Droppable>
            </ DragDropContext>
        </>
    );
};

export default TopicsTab;
