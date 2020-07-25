import React, { useEffect, useState, useRef } from 'react';
import EnterRightAnimWrapper from './EnterRightAnimWrapper';
import TopicsList from '../TopicsList';
import { Button, Col, Row, Accordion, Card, Modal, FormControl, FormLabel, FormGroup, Spinner, Form } from 'react-bootstrap';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { useParams } from 'react-router-dom';
import TopicCreationModal from './TopicCreationModal';
import _ from 'lodash';
import { TopicObject, CourseObject, UnitObject, NewCourseUnitObj, NewCourseTopicObj, ProblemObject, uniqueGen } from '../CourseInterfaces';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import MomentUtils from '@date-io/moment';
import { DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';

import './Course.css';
import { BsPlusCircleFill } from 'react-icons/bs';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

interface CourseEditPageProps {

}

/**
 * This page requires an ICourseTemplate ID.
 * Editing a Template Course means getting all details from that template, but saving
 * to a new row.
 */
export const CourseEditPage: React.FC<CourseEditPageProps> = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<CourseObject>(new CourseObject({}));
    const history = useHistory();
    const [showTopicCreation, setShowTopicCreation] = useState<{show: boolean, unitIndex: number, existingTopic?: TopicObject | undefined}>({show: false, unitIndex: -1});
    const [showLoadingSpinner, setShowLoadingSpinner] = useState<boolean>(false);
    const [shouldFocusNewUnit, setShouldFocusNewUnit] = useState<boolean>(false);
    const newestUnitRef = useRef<HTMLHeadingElement>(null);

    // Load the curriculum that populates the template.
    useEffect(() => {
        (async ()=>{
            try {
                let course = await AxiosRequest.get(`/curriculum/${courseId}`);
                // TODO: Error handling for bad template id.
                console.log(course.data.data);
                const courseData = course.data.data;
                courseData.units = courseData.units.map((unit: any) => {
                    unit.topics = unit.topics.map((t: any) => new NewCourseTopicObj(t));
                    return new UnitObject(unit);
                });
                setCourse(courseData);
            } catch (e) {
                console.error('A bad Curriculum ID was used.', e);
            }
        })();
    }, [courseId]);

    useEffect(() => {
        if (shouldFocusNewUnit && newestUnitRef?.current) {
            newestUnitRef.current.focus();
            const range = document.createRange();
            range.selectNodeContents(newestUnitRef.current);
            window.getSelection()?.removeAllRanges();
            window.getSelection()?.addRange(range);
            setShouldFocusNewUnit(false);
        }
    }, [shouldFocusNewUnit]);

    const callShowTopicCreation = (unitIndex: number, e: any = null) => {
        if (e != null) {
            e.stopPropagation();
            e.preventDefault();
        }
        console.log(`Showing Topic Add for unit in index ${unitIndex}`);
        setShowTopicCreation({show: true, unitIndex: unitIndex});
    };

    // Adds a topic to the selected unit.
    // unitIndex is the index of the unit in the current course.
    const addTopic = (unitIndex: number, existingTopic: TopicObject | null | undefined, topic: TopicObject) => {
        let newCourse: CourseObject = {...course};
        let unit = _.find(newCourse.units, ['unique', unitIndex]);

        if (!unit) {
            console.error(`Could not find a unit with id ${unitIndex}`);
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
            topic.contentOrder = unit.topics.length;
            unit.topics = _.concat(unit.topics, new NewCourseTopicObj(topic));
        }

        setCourse(newCourse);
        setShowTopicCreation({show: false, unitIndex: -1});
    };

    const removeTopic = (e: any, unitId: number, topicId: number) => {
        let newCourse: CourseObject = {...course};
        let unit = _.find(newCourse.units, ['unique', unitId]);

        if (!unit) {
            console.error(`Could not find a unit with id ${unitId}`);
            return;
        }

        // TODO: Do we need a confirmation workflow?

        unit.topics = _.reject(unit.topics, ['unique', topicId]);
        setCourse(newCourse);
    };
    
    // Save a course by recurisvely saving all sub-objects.
    const saveCourse = async (course: any) => {
        setShowLoadingSpinner(true);
        // Course ID is generated from the CreateCourse call right before this.
        const createUnit = async (unit: NewCourseUnitObj, newCourseId: number) => {
            console.log(`creating unit for course number ${newCourseId}`, unit);
            // Create the unit first.
            const newUnitFields = ['name', 'courseId', 'contentOrder'];
            let unitPostObject = _.pick(unit, newUnitFields);
            unitPostObject.courseId = newCourseId;
            console.log('Creating a new unit', unitPostObject);
            let unitRes = await AxiosRequest.post('/courses/unit', unitPostObject);
            console.log(unitRes);

            if (unitRes?.status !== 201) {
                console.error('Post unit failed.');
                return;
            }
    
            const newUnitId = unitRes?.data.data.id;
            
            console.log(`Currying createUnit with ${newUnitId}`);
            const createTopicForUnit = _.curry(createTopic)(_, newUnitId);
            // WARNING: Why does this need to be cast as any, when this pattern works below?
            await Promise.all(unit.topics.map((createTopicForUnit as any)));
        };
        
        const createTopic = async (topic: NewCourseTopicObj, courseUnitContentId: number) => {
            let newTopic = new NewCourseTopicObj(topic);
            newTopic.courseUnitContentId = courseUnitContentId;
            const newTopicFields = [ 
                'courseUnitContentId', 'topicTypeId', 'name', 'startDate', 'endDate', 'deadDate', 'partialExtend', 'contentOrder'
            ];
            let postObject = _.pick(newTopic, newTopicFields);
            console.log('Creating topic', postObject);
            let res = await AxiosRequest.post('/courses/topic', postObject);
            console.log(res);
            let topicId = res.data?.data?.id;
            
            const createProblemForTopic = _.curry(createProblem)(_, topicId);
            await Promise.all(newTopic.questions.map(createProblemForTopic));
        };
        
        const createProblem = async (problem: ProblemObject, courseTopicContentId: number) => {
            let newProblem = new ProblemObject(problem);
            const newProblemFields = [
                'problemNumber', 'webworkQuestionPath', 'courseTopicContentId', 'weight', 'maxAttempts', 'hidden', 'optional'
            ];
            let postObject: any = _.pick(newProblem, newProblemFields);
            postObject.courseTopicContentId = courseTopicContentId;
            console.log('Creating problem', postObject, ' from ', problem);
            const res = await AxiosRequest.post('/courses/question', postObject);
            console.log(res);
        };

        // via 1loc.dev (consider moving to a utilities folder)
        const generateString = (length: number): string => Array(length).fill('').map(() => Math.random().toString(36).charAt(2)).join('');

        const createCourse = async (course: CourseObject) => {
            // Not every field belongs in the request.
            const newCourseFields = ['curriculum', 'name', 'code', 'start', 'end', 'sectionCode', 'semesterCode'];
            let postObject = _.pick(course, newCourseFields);
            postObject.code = `${postObject.sectionCode}_${postObject.semesterCode}_${generateString(4).toUpperCase()}`;
            // TODO: Fix naming for route, should be 'templateId'.

            if (!courseId) {
                // TODO: Move this to the useEffect, navigate away if it fails?
                return;
            }

            postObject.curriculumId = parseInt(courseId, 10);
            console.log('Creating a new course');
            console.log(JSON.stringify(postObject));
            return await AxiosRequest.post('/courses', postObject);
        };

        let res;
        try {
            res = await createCourse(course);
            console.log(res);
        } catch (e) {
            console.error('Error creating course:', e);
        }

        if (res?.status !== 201) {
            console.error('Post failed.');
            return;
        }

        const newCourseId = res.data.data.id;
        console.log(`Currying createUnit with ${newCourseId}`);
        const createUnitForCourse = _.curry(createUnit)(_, newCourseId);
        try {
            let unitRes = await Promise.all(course?.units?.map(createUnitForCourse));
            console.log(unitRes);
            // TODO: Need to handle extra validation to make sure everything succeeded.
            console.log('The course was successfully created (based on the log above)');
            history.replace('/common/courses');
        } catch (e) {
            console.error('An error occurred when creating this course', e);
            console.log(e.response?.data.message);
            setShowLoadingSpinner(false);
        }

        return false;
    };

    const updateCourseValue = (field: keyof CourseObject, e: any) => {
        const value = e.target.value;
        switch (field) {
        case 'start':
        case 'end':
            setCourse({...course, [field]: moment(value).toDate()});
            break;
        default:
            setCourse({...course, [field]: value});
        }
    };

    const showEditTopic = (e: any, unitIndex: number, topicId: number) => {
        console.log(`Editing topic ${topicId} in unit ${unitIndex}`);
        let unit = _.find(course.units, ['unique', unitIndex]);
        console.log(unit);
        if (!unit) {
            console.error(`Cannot find unit with id ${unitIndex}`);
            return;
        }

        const topic = _.find(unit.topics, ['unique', topicId]);
        if (!topic) {
            console.error(`Cannot find topic with id ${topicId} in unit with id ${unitIndex}`);
            return;
        }
        setShowTopicCreation({show: true, unitIndex: unitIndex, existingTopic: topic});
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        saveCourse(course);
    };

    const addUnit = () => {
        let newCourse = new CourseObject(course);
        newCourse.units.push(new UnitObject({name: 'New Unit' }));
        setCourse({...newCourse});
        setShouldFocusNewUnit(true);
    };

    const handleRenameUnit = (e: any, unitIndex: number) => {
        let newCourse = new CourseObject(course);
        let updatingUnit = _.find(newCourse.units, ['unique', unitIndex]);
        if (!updatingUnit) {
            console.error(`Could not find a unit with the unique identifier ${unitIndex}`);
            return;
        }
    
        console.log(e.target);
        console.log(e.target.innerText);
        updatingUnit.name = e.target.innerText;
        console.log(`Updating Unit ${unitIndex} name.`, newCourse);
        setCourse(newCourse);
    };
 
    const reorder = (list: Array<any>, startIndex: number, endIndex: number) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
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
            onUnitDrop(result);
        } else if (result.type === 'TOPIC') {
            const courseCopy = new CourseObject(course);
            // For topics, we have to handle cross-droppable reordering.
            const sourceUnitUnique = parseInt(result.source.droppableId.substring('topicList-'.length), 10);
            const destUnitUnique = parseInt(result.destination.droppableId.substring('topicList-'.length), 10);
            console.log(`Source unit unique: ${sourceUnitUnique}, Destination unit unique: ${destUnitUnique}`);

            const sourceUnit = _.find(courseCopy.units, ['unique', sourceUnitUnique]);
            if (!sourceUnit) {
                console.error('Could not find a source unit specified in drag. Is the unique tag correct?', sourceUnitUnique, result, courseCopy.units);
                return;
            }

            if (sourceUnitUnique === destUnitUnique) {
                const newTopics = reorder(sourceUnit.topics, result.source.index, result.destination.index);
                sourceUnit.topics = newTopics.map((topic, i) => {
                    topic.contentOrder = i;
                    return topic;
                });

            } else {
                const destUnit = _.find(courseCopy.units, ['unique', destUnitUnique]);
                if (!destUnit) {
                    console.error('Could not find a source unit specified in drag. Is the unique tag correct?', destUnitUnique, result, courseCopy.units);
                    return;
                }
                // const sourceUnitTopics = Array.from(sourceUnit.topics);
                // const destUnitTopics = Array.from(destUnit.topics);
                
                // Remove from source unit, add to the destination unit.
                const [removed] = sourceUnit.topics.splice(result.source.index, 1);
                destUnit.topics.splice(result.destination.index, 0, removed);
            }

            setCourse(courseCopy);
        }
    };

    const onUnitDrop = (result: any) => {
        console.log(`trying to move unit from ${result.source.index} to ${result.destination.index}`);

        let newUnits = reorder(course?.units, result.source.index, result.destination.index);
        newUnits = newUnits.map((prob, i) => {
            prob.contentOrder = i;
            return prob;
        });
    
        course.units = newUnits;
        setCourse({...course});
    };
    
    return (
        <EnterRightAnimWrapper>
            <Form onSubmit={handleSubmit}>
                <FormGroup controlId='course-name'>
                    <Row>
                        <FormLabel column sm={2}>
                            <h3>Course Name: </h3>
                        </FormLabel>
                        <Col>
                            <FormControl 
                                required
                                size='lg' 
                                defaultValue={course?.name || ''}
                                onChange={(e: any) => updateCourseValue('name', e)}
                            />
                        </Col>
                    </Row>
                </FormGroup>
                <Row>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Col>
                            <h4>Start Date</h4>
                            <DateTimePicker 
                                variant='inline'
                                // label='Start date'
                                name={'start-date'}
                                value={course.start}
                                onChange={() => {}}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    const e = {target: {value: date.toDate()}};
                                    updateCourseValue('start', e);
                                }}
                                fullWidth={true}
                                InputLabelProps={{shrink: true}}
                                inputProps={{style: {textAlign: 'center'}}}
                            />
                        </Col>
                        <Col>
                            <h4>End Date</h4>
                            <DateTimePicker 
                                variant='inline'
                                // label='End date'
                                name={'end-date'}
                                value={course.end}
                                onChange={() => {}}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    const e = {target: {value: date.toDate()}};
                                    updateCourseValue('end', e);
                                }}
                                fullWidth={true}
                                InputLabelProps={{shrink: false}}
                                inputProps={{style: {textAlign: 'center'}}}
                            />
                        </Col>
                    </MuiPickersUtilsProvider>
                </Row>
                <Row>
                    <Col>
                        <FormGroup controlId='section-code'>
                            <FormLabel>
                                <h4>Section Code:</h4>
                            </FormLabel>
                            <FormControl type='text' placeholder='MAT120' 
                                required
                                onChange={(e: any) => updateCourseValue('sectionCode', e)}/>
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup controlId='semester-code'>
                            <FormLabel>
                                <h4>Semester Code:</h4>
                            </FormLabel>
                            <FormControl type='text' placeholder='SUM20'
                                required
                                onChange={(e: any) => updateCourseValue('semesterCode', e)}/>
                        </FormGroup>
                    </Col>
                </Row>
                <h4>Units</h4>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId='unitsList' type='UNIT'>
                        {
                            (provided: any) => (
                                <>
                                    <div ref={provided.innerRef} style={{backgroundColor: 'white'}} {...provided.droppableProps}>
                                        {course?.units?.map((unit: any, index) => {
                                            const showEditWithUnitId = _.curry(showEditTopic)(_, unit.unique);
                                            const removeTopicWithUnitId = _.curry(removeTopic)(_, unit.unique);
                                            const renameUnit = _.curry(handleRenameUnit)(_, unit.unique);

                                            unit.contentOrder = index;

                                            return (
                                                <Draggable draggableId={`unitRow${unit.unique}`} index={index} key={`problem-row-${unit.unique}`}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} key={unit.unique}>
                                                            <Accordion defaultActiveKey="1">
                                                                <Card>
                                                                    <Accordion.Toggle as={Card.Header} eventKey="0">
                                                                        <Row>
                                                                            <Col>
                                                                                <h4 
                                                                                    ref={index === course.units.length - 1 ? newestUnitRef : null}
                                                                                    contentEditable='true' 
                                                                                    className='active-editable'
                                                                                    onBlur={renameUnit}
                                                                                    onKeyDown={(e: any) => {
                                                                                        if (e.keyCode === 13) {
                                                                                            e.preventDefault();
                                                                                            e.target.blur();
                                                                                        }
                                                                                    }}
                                                                                >{unit.name}</h4>
                                                                            </Col>
                                                                            <Col>
                                                                                <Button className='float-right' onClick={(e: any) => callShowTopicCreation(unit.unique, e)}>
                                                                                Add a Topic
                                                                                </Button>
                                                                            </Col>
                                                                        </Row>
                                                                    </Accordion.Toggle>
                                                                    <Accordion.Collapse eventKey="0">
                                                                        <Card.Body>
                                                                            <TopicsList 
                                                                                flush
                                                                                listOfTopics={unit.topics} 
                                                                                showEditTopic={showEditWithUnitId}
                                                                                removeTopic={removeTopicWithUnitId}
                                                                                unitUnique={unit.unique}
                                                                            />
                                                                        </Card.Body>
                                                                    </Accordion.Collapse>
                                                                </Card>
                                                            </Accordion>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                    </div>
                                    {provided.placeholder}
                                </>
                            )
                        }
                    </Droppable>
                </DragDropContext>
                <div
                    className='accordion card card-header add-new-unit text-center'
                    onClick={addUnit} 
                >
                    <h4><BsPlusCircleFill/> Add Unit</h4>
                </div>
                <Button block size='lg' type='submit'>Save Course</Button>
            </Form>
            <Modal 
                show={showTopicCreation.show} 
                onHide={() => setShowTopicCreation({show: false, unitIndex: -1})}
                dialogClassName="topicCreationModal"    
            >
                <TopicCreationModal 
                    unitIndex={showTopicCreation.unitIndex}
                    addTopic={addTopic}
                    existingTopic={showTopicCreation.existingTopic}
                />
            </Modal>
            <Modal show={showLoadingSpinner} className='text-center'>
                <h4>Creating course, please wait.</h4>
                <Spinner animation='grow' role='status' style={{width: '10rem', height: '10rem', margin: '0 auto'}}>
                    <span className='sr-only'>Creating course, please wait...</span>
                </Spinner>
            </Modal>
        </EnterRightAnimWrapper>
    );
};

export default CourseEditPage;
