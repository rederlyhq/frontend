import React, { useState, useCallback, useEffect } from 'react';
import { FormControl, FormLabel, Form, FormGroup, Modal, Button, InputGroup, Col, Row, FormCheck, Alert } from 'react-bootstrap';
import _ from 'lodash';
import { ProblemObject, NewCourseTopicObj } from '../CourseInterfaces';
import moment from 'moment';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MomentUtils from '@date-io/moment';
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { FaTrash } from 'react-icons/fa';
import { putQuestion, postQuestion, putTopic, postDefFile, deleteQuestion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { ConfirmationModal } from '../../Components/ConfirmationModal';
import { CheckboxHider, CheckboxHiderChildrenPosition } from '../../Components/CheckboxHider';

interface TopicCreationModalProps {
    unitIndex: number;
    addTopic: (unitIndex: number, existingTopic: NewCourseTopicObj | null | undefined, topic: NewCourseTopicObj) => void;
    existingTopic?: NewCourseTopicObj;
    closeModal?: () => void;
    updateTopic?: (topic: NewCourseTopicObj) => void;
}

/**
 * Topics are either a list of problems/weights, or a DEF file.
 * NOTE: The ProblemObject.problemNumber doesn't mean anything on this page, because it's going
 * to be set based on its position in the `problems` array.
 */
export const TopicCreationModal: React.FC<TopicCreationModalProps> = ({ unitIndex, addTopic, existingTopic, closeModal, updateTopic }) => {
    const DEFAULT_CONFIRMATION_PARAMETERS = {
        show: false,
        onConfirm: null,
        identifierText: ''
    };

    const [error, setError] = useState<Error | null>(null);
    const [topicMetadata, setTopicMetadata] = useState<NewCourseTopicObj>(new NewCourseTopicObj(existingTopic));
    const [problems, setProblems] = useState<Array<ProblemObject>>(existingTopic ? existingTopic.questions : []);
    const [confirmationParamters, setConfirmationParamters] = useState<{ show: boolean, identifierText: string, onConfirm?: (() => unknown) | null }>(DEFAULT_CONFIRMATION_PARAMETERS);
    const webworkBasePath = 'webwork-open-problem-library/';

    useEffect(() => {
        const isSorted = problems.slice(1).every((prob, i) => problems[i].problemNumber <= prob.problemNumber);

        if (!isSorted) {
            setProblems(_.sortBy(problems, ['problemNumber']));
        }
    }, [problems]);

    /**
     * Handles state for input for each problem.
     * @param index  - The index of the FormGroup generated.
     * @param name   - The name of the form element to be updated.
     * @param e      - The event object.
     * */
    const onFormChange = async (index: number, name: keyof ProblemObject, e: any) => {
        let val = e.target.value;
        let probs = [...problems];

        // TODO: Handle validation.
        switch (name) {
        case 'webworkQuestionPath':
        case 'path':
            probs[index].webworkQuestionPath = val;
            break;
        case 'weight':
        case 'maxAttempts':
        case 'problemNumber':
        case 'id':
            probs[index][name] = parseInt(val, 10);
            break;
        case 'optional':
            probs[index][name] = e.target.checked;
            break;
        case 'unique':
            break;
        default:
            probs[index][name] = val;
        }

        setProblems(probs);
    };

    const onFormBlur = async (index: number, name: keyof ProblemObject, e: any) => {
        const key = name === 'path' ? 'webworkQuestionPath' : name;
        // const initialValue = problems[index][key];
        let val = e.target.value;
        let probs = _.cloneDeep(problems);

        // TODO: Handle validation.
        switch (name) {
        case 'webworkQuestionPath':
        case 'path':
            probs[index].webworkQuestionPath = val;
            break;
        case 'weight':
        case 'maxAttempts':
        case 'problemNumber':
        case 'id':
            val = parseInt(val, 10);
            probs[index][name] = val;
            break;
        case 'optional':
            val = e.target.checked;
            probs[index][name] = val;
            break;
        case 'unique':
            break;
        default:
            probs[index][name] = val;
        }

        // TODO prevent updates if nothing changed
        // The problem here is that we update the state before we update the backend
        // if (probs[index][name] === initialValue) {
        //     return;
        // }
        try {
            // We could find the question and update from the response
            // It would update other fields too if they were stale
            // However other objects would still be stale
            // And we've already updated the object itself
            setError(null);
            await putQuestion({
                id: probs[index].id,
                data: {
                    [key]: val
                }
            });
    
            setProblems(probs);
        } catch (e) {
            setError(e);
            // No need to set problems back because they haven't been modified yet
            // TODO They won't revert because of the way the topic modal was written
        }
    };

    const deleteProblem = async (problemId: number) => {
        try {
            setError(null);
            await deleteQuestion({
                id: problemId
            });    
            let newProblems = [...problems];
            const deletedProblem = _.find(newProblems, ['id', problemId]);
            // Decrement everything after
            if (!_.isNil(deletedProblem)) {
                _.filter(newProblems, problem => problem.problemNumber > deletedProblem.problemNumber).forEach(problem => problem.problemNumber--);
            }
            newProblems = _.reject(newProblems, ['id', problemId]);
            setProblems(newProblems);
            const newTopic = new NewCourseTopicObj(existingTopic);
            newTopic.questions = newProblems;
            updateTopic?.(newTopic);
        } catch (e) {
            setError(e);
        }
    };

    const deleteProblemClick = (event: React.KeyboardEvent<HTMLSpanElement> | React.MouseEvent<HTMLSpanElement, MouseEvent>, problemId: number) => {
        event.stopPropagation();
        setConfirmationParamters({
            show: true,
            // In the future we might want to pass something like topic name here
            identifierText: 'this question',
            onConfirm: _.partial(deleteProblem, problemId)
        });
    };

    const addProblemRows = (problem: ProblemObject, index: number): any => {
        const onFormChangeProblemIndex = _.curry(onFormChange)(index);
        const onFormBlurProblemIndex = _.curry(onFormBlur)(index);
        return (
            <Draggable draggableId={`problemRow${problem.id}`} index={index} key={`problem-row-${problem.id}`}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <Row>
                            <Col>
                                {/* <h4>Problem #{problem.problemNumber}</h4> */}
                                <h4>Problem #{index + 1}</h4>
                            </Col>
                            <Col
                                style={{
                                    textAlign: 'end'
                                }}
                            >
                                <span
                                    role="button"
                                    tabIndex={0}
                                    style={{
                                        padding: '6px'
                                    }}
                                    onClick={_.partial(deleteProblemClick, _, problem.id)}
                                    onKeyPress={_.partial(deleteProblemClick, _, problem.id)}
                                >
                                    <FaTrash color='#AA0000' />
                                </span>
                            </Col>
                        </Row>
                        <FormGroup controlId={`problem${index}`}>
                            <FormLabel>Problem Path:</FormLabel>
                            {/* This might be a nice UI addition, but might be annoying if we don't autoremove a duplicate. */}
                            <InputGroup>
                                <FormControl
                                    required
                                    value={problem.webworkQuestionPath}
                                    onChange={onFormChangeProblemIndex('webworkQuestionPath')}
                                    onBlur={onFormBlurProblemIndex('webworkQuestionPath')}
                                />
                            </InputGroup>
                        </FormGroup>
                        <Row>
                            <FormGroup as={Col} controlId={`weight${index}`}>
                                <FormLabel>Problem Weight:</FormLabel>
                                {/* Should this be a range? */}
                                <FormControl
                                    value={problem.weight}
                                    type='number'
                                    min={0}
                                    onChange={onFormChangeProblemIndex('weight')}
                                    onBlur={onFormBlurProblemIndex('weight')}
                                />
                            </FormGroup>
                            <FormGroup as={Col} controlId={`attempts${index}`}>
                                <FormLabel>Maximum Attempts:</FormLabel>
                                {/* Should this be a range? */}
                                <FormControl
                                    value={problem.maxAttempts}
                                    type='number'
                                    min={-1}
                                    onChange={onFormChangeProblemIndex('maxAttempts')}
                                    onBlur={onFormBlurProblemIndex('maxAttempts')}
                                />
                            </FormGroup>
                            <FormGroup as={Col} controlId={`optional${index}`}>
                                <FormCheck
                                    label='Optional?'
                                    checked={problem.optional}
                                    type='checkbox'
                                    onChange={onFormChangeProblemIndex('optional')}
                                    onBlur={onFormBlurProblemIndex('optional')}
                                />
                            </FormGroup>
                        </Row>
                    </div>
                )}
            </Draggable>
        );
    };

    const onTopicMetadataChange = (e: any, name: keyof NewCourseTopicObj) => {
        let val = e.target.value;
        console.log(`updating ${name} to ${val}`);
        switch (name) {
        case 'startDate':
        case 'endDate':
        case 'deadDate':
            val = moment(val);
            break;
        }

        const updates = {
            [name]: val
        };

        if (name === 'endDate' && (val.isAfter(moment(topicMetadata.deadDate)) || moment(topicMetadata.deadDate).isSame(moment(topicMetadata.endDate)))) {
            updates.deadDate = val;
        }

        setTopicMetadata({ ...topicMetadata, ...updates });

        console.log(topicMetadata);
    };

    const onTopicMetadataBlur = async (e: any, name: keyof NewCourseTopicObj) => {
        let val = e.target.value;
        console.log(`updating ${name} to ${val}`);
        switch (name) {
        case 'startDate':
        case 'endDate':
        case 'deadDate':
            val = moment(val);
            break;
        }

        const updates = {
            [name]: val
        };

        if (name === 'endDate' && (val.isAfter(moment(topicMetadata.deadDate)) || moment(topicMetadata.deadDate).isSame(moment(topicMetadata.endDate)))) {
            updates.deadDate = val;
        }

        try {
            setError(null);
            if(_.isNil(existingTopic)) {
                console.error('Tried to edit a topic that does not exist');
                throw new Error('Error updating existing topic');
            }
            // We could pull the changes down however we already have them so why bother
            await putTopic({
                id: existingTopic.id,
                data: updates
            });

            setTopicMetadata({ ...topicMetadata, ...updates });
    
            if(_.isNil(existingTopic)) {
                console.error('Cannot update topic because it is nil');
                return;
            }
            updateTopic?.({
                ...existingTopic,
                ...topicMetadata
            });
    
            console.log(topicMetadata);    
        } catch (e) {
            setError(e);
        }
    };

    const onDrop = useCallback(acceptedFiles => {
        (async () => {
            try {
                setError(null);
                if (_.isNil(existingTopic)) {
                    console.error('existing topic is nil');
                    throw new Error('Cannot find topic you are trying to add questions to');
                }
                const res = await postDefFile({
                    acceptedFiles,
                    courseTopicId: existingTopic.id
                });
                const newProblems = [
                    ...problems,
                    ...res.data.data.newQuestions.map((question: ProblemObject) => new ProblemObject(question))
                ];
                setProblems(newProblems);
                const newTopic = new NewCourseTopicObj(existingTopic);
                newTopic.questions = newProblems;
                updateTopic?.(newTopic);
            } catch (e) {
                setError(e);
            }
        })();
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        closeModal?.();
        return;
        const problemsWithOrdering = problems.map((problem, index) => {
            // Problems should always render in the order that the professor sets them.
            problem.problemNumber = index + 1; // problemNumber should be 1..n not 0..(n-1)

            // If the base path is present, this is already a full path and should escape further processing.
            if (_.startsWith(problem.webworkQuestionPath, webworkBasePath)) {
                return problem;
            }

            problem.webworkQuestionPath = problem.webworkQuestionPath.replace(/^Library/, 'OpenProblemLibrary');
            // If we don't recognize the prefix, assume they're using Contrib.
            if (_.startsWith(problem.webworkQuestionPath, 'Contrib') || _.startsWith(problem.webworkQuestionPath, 'OpenProblemLibrary')) {
                problem.webworkQuestionPath = `${webworkBasePath}${problem.webworkQuestionPath}`;
            } else {
                problem.webworkQuestionPath = `${webworkBasePath}Contrib/${problem.webworkQuestionPath}`;
            }

            return problem;
        });
        console.log(problemsWithOrdering);
        console.log(topicMetadata);
        addTopic(unitIndex, existingTopic, new NewCourseTopicObj({ ...topicMetadata, questions: problemsWithOrdering }));
    };

    const onDragEnd = async (result: any) => {
        try {
            if (!result.destination) {
                return;
            }
    
            if (result.destination.index === result.source.index) {
                return;
            }
    
            const newContentOrder = result.destination.index + 1;
            const problemIdRegex = /^problemRow(\d+)$/;
            const { draggableId: problemDraggableId } = result;
            // If exec doesn't match the result will be null
            // If it does succeed the index `1` will always be the group above
            const problemId = problemIdRegex.exec(problemDraggableId)?.[1];
            if(_.isNil(problemId)) {
                console.error('problem not found could not update backend');
                return;
            }

            let newProbs = _.cloneDeep(problems);
            const existingProblem = _.find(newProbs, ['id', parseInt(problemId, 10)]);
            if(_.isNil(existingProblem)) {
                console.error('existing problem not found could not update frontend');
                return;
            }

            existingProblem.problemNumber = newContentOrder;
            const [removed] = newProbs.splice(result.source.index, 1);
            newProbs.splice(result.destination.index, 0, removed);
            setProblems(newProbs);
            let newTopic: NewCourseTopicObj | null = null;
            if (!_.isNil(existingTopic)) {
                newTopic = _.cloneDeep(existingTopic);
                newTopic.questions = newProbs;
                updateTopic?.(newTopic);
            }
    
            setError(null);
            const response = await putQuestion({
                id: parseInt(problemId, 10),
                data: {
                    problemNumber: parseInt(newContentOrder, 10)
                }
            });

            response.data.data.updatesResult.forEach((returnedProblem: Partial<ProblemObject>) => {
                const existingProblem = _.find(newProbs, ['id', returnedProblem.id]);
                Object.assign(existingProblem, returnedProblem);
                newProbs = [...newProbs];
                setProblems(newProbs);
                if (!_.isNil(newTopic)) {
                    newTopic = new NewCourseTopicObj(newTopic);
                    newTopic.questions = newProbs;
                    updateTopic?.(newTopic);
                }
            });
        } catch (e) {
            setError(e);
            setProblems(problems);
            if (!_.isNil(existingTopic)) {
                updateTopic?.(existingTopic);
            }
        }
    };

    const addNewQuestion = async () => {
        try {
            setError(null);
            const result = await postQuestion({
                data: {
                    courseTopicContentId: existingTopic?.id
                }
            });

            const newProb = new ProblemObject(result.data.data);
            const newProblems = [
                ...problems,
                newProb
            ];
            setProblems(newProblems);
            
            if(_.isNil(existingTopic)) {
                console.error('Cannot update topic because it is nil');
                return;
            }
            existingTopic.questions = newProblems;
            updateTopic?.(existingTopic);
        } catch (e) {
            setError(e);
        }
    };

    const addNewQuestionClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        addNewQuestion();
    };

    return (
        <>
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
            <Form
                onSubmit={handleSubmit}
                {...getRootProps()}
                onClick={() => { }}
                style={_({
                    backgroundColor: isDragActive ? 'red' : undefined,
                    // TODO this is a terrible work around, however when I actually make this component a modal
                    // The topic data stops rendering correctly
                    // I think it has to do with how we pass props in and will need serious rework
                    display: confirmationParamters.show ? 'none' : undefined
                }).omitBy(_.isUndefined).value()}
            >
                <Modal.Header closeButton>
                    <h3>{existingTopic ? `Editing: ${existingTopic.name}` : 'Add a Topic'}</h3>
                </Modal.Header>
                <Modal.Body style={{ minHeight: `${24 + (problems.length * 19)}vh` }}>
                    {error && <Alert variant="danger">{error.message}</Alert>}
                    <input type="file" {...getInputProps()} />
                    <h6>Add questions to your topic, or import a question list by dragging in a DEF file.</h6>
                    <FormGroup as={Row} controlId='topicTitle' onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); }}>
                        <Form.Label column sm="2">Topic Title:</Form.Label>
                        <Col sm="10">
                            <FormControl
                                required
                                onChange={(e: any) => onTopicMetadataChange(e, 'name')}
                                onBlur={(e: any) => onTopicMetadataBlur(e, 'name')}
                                defaultValue={topicMetadata?.name}
                            />
                        </Col>
                    </FormGroup>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Row>
                            <Col>
                                <DateTimePicker
                                    variant='inline'
                                    label='Start date'
                                    name={'start'}
                                    value={topicMetadata.startDate}
                                    onChange={() => { }}
                                    onAccept={(date: MaterialUiPickersDate) => {
                                        if (!date) return;
                                        const e = { target: { value: date.toDate() } };
                                        onTopicMetadataChange(e, 'startDate');
                                        onTopicMetadataBlur(e, 'startDate');
                                    }}
                                    fullWidth={true}
                                    InputLabelProps={{ shrink: false }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                    defaultValue={moment(topicMetadata?.startDate).format('YYYY-MM-DD')}
                                />
                            </Col>
                            <Col>
                                <DateTimePicker
                                    variant='inline'
                                    label='End date'
                                    name={'end'}
                                    value={topicMetadata.endDate}
                                    onChange={() => { }}
                                    onAccept={(date: MaterialUiPickersDate) => {
                                        if (!date) return;
                                        const e = { target: { value: date.toDate() } };
                                        onTopicMetadataChange(e, 'endDate');
                                        onTopicMetadataBlur(e, 'endDate');
                                    }}
                                    fullWidth={true}
                                    InputLabelProps={{ shrink: false }}
                                    inputProps={{ style: { textAlign: 'center' } }}
                                    defaultValue={moment(topicMetadata?.endDate).format('YYYY-MM-DD')}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <CheckboxHider
                                style={{
                                    margin: '10px',
                                    alignSelf: 'center'
                                }}
                                labelText='Partial Credit Extension Date?'
                                defaultChecked={!moment(topicMetadata.endDate).isSame(moment(topicMetadata.deadDate))}
                                onChange={(newValue: boolean) => {
                                    if (!newValue) {
                                        const e = { target: { value: topicMetadata.endDate } };
                                        onTopicMetadataChange(e, 'deadDate');
                                        onTopicMetadataBlur(e, 'deadDate');
                                    }
                                }}
                                position={CheckboxHiderChildrenPosition.BEFORE}
                                stackLabel={false}
                            >
                                <Col md={6}>
                                    <DateTimePicker
                                        variant='inline'
                                        label='Dead date'
                                        name={'dead'}
                                        value={topicMetadata.deadDate}
                                        onChange={() => { }}
                                        onAccept={(date: MaterialUiPickersDate) => {
                                            if (!date) return;
                                            const e = { target: { value: date.toDate() } };
                                            onTopicMetadataChange(e, 'deadDate');
                                            onTopicMetadataBlur(e, 'deadDate');
                                        }}
                                        fullWidth={true}
                                        InputLabelProps={{ shrink: false }}
                                        inputProps={{ style: { textAlign: 'center' } }}
                                        defaultValue={moment(topicMetadata?.endDate).format('YYYY-MM-DD')}
                                    />
                                </Col>
                            </CheckboxHider>
                        </Row>
                    </MuiPickersUtilsProvider>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId='problemsList'>
                            {
                                (provided) => (
                                    <div ref={provided.innerRef} style={{ backgroundColor: 'white' }} {...provided.droppableProps}>
                                        {problems.map(addProblemRows)}
                                        {provided.placeholder}
                                    </div>
                                )
                            }
                        </Droppable>
                    </DragDropContext>
                </Modal.Body>
                <Modal.Footer>
                    {/* Do we need a cancel button in the Modal? You can click out and click the X. */}
                    {/* <Button variant="danger" className="float-left">Cancel</Button> */}
                    <Button variant="secondary" onClick={getRootProps().onClick}>Upload a DEF file</Button>
                    <Button variant="secondary" onClick={addNewQuestionClick}>Add Another Question</Button>
                    <Button
                        variant="primary"
                        type='submit'
                    // disabled={problems.length <= 0}
                    >Finish</Button>
                </Modal.Footer>
            </Form>
        </>
    );
};

export default TopicCreationModal;
