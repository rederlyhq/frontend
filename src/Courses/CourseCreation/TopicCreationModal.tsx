import React, { useState, useCallback, useEffect } from 'react';
import { FormControl, FormLabel, Form, FormGroup, Modal, Button, InputGroup, Col, Row, FormCheck } from 'react-bootstrap';
import _ from 'lodash';
import { ProblemObject, NewCourseTopicObj } from '../CourseInterfaces';
import moment from 'moment';
import { useDropzone } from 'react-dropzone';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import MomentUtils from '@date-io/moment';
import { DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

interface TopicCreationModalProps {
    unitIndex: number;
    addTopic: (unitIndex: number, existingTopic: NewCourseTopicObj | null | undefined, topic: NewCourseTopicObj) => void;
    existingTopic?: NewCourseTopicObj;
}

/**
 * Topics are either a list of problems/weights, or a DEF file.
 * NOTE: The ProblemObject.problemNumber doesn't mean anything on this page, because it's going
 * to be set based on its position in the `problems` array.
 */
export const TopicCreationModal: React.FC<TopicCreationModalProps> = ({unitIndex,  addTopic, existingTopic}) => {
    const [topicMetadata, setTopicMetadata] = useState<NewCourseTopicObj>(new NewCourseTopicObj(existingTopic));
    const [problems, setProblems] = useState<Array<ProblemObject>>(existingTopic ? existingTopic.questions : []);
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
    const onFormChange = (index: number, name: keyof ProblemObject, e: any) => {
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
            probs[index][name] = !probs[index][name];
            break;
        case 'unique':
            break;
        default:
            probs[index][name] = val;
        }

        setProblems(probs);
    };

    const addProblemRows = (problem: ProblemObject, count: number) : any => {
        const onFormChangeProblemIndex = _.curry(onFormChange)(count);
        return (
            <Draggable draggableId={`problemRow${problem.unique}`} index={problem.problemNumber} key={`problem-row-${problem.unique}`}>
                {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <FormGroup controlId={`problem${count}`}>
                            <FormLabel>Problem Path:</FormLabel>
                            {/* This might be a nice UI addition, but might be annoying if we don't autoremove a duplicate. */}
                            <InputGroup>
                                <FormControl 
                                    required 
                                    value={problem.webworkQuestionPath} 
                                    onChange={onFormChangeProblemIndex('webworkQuestionPath')}
                                />
                            </InputGroup>
                        </FormGroup>
                        <Row>
                            <FormGroup as={Col} controlId={`weight${count}`}>
                                <FormLabel>Problem Weight:</FormLabel>
                                {/* Should this be a range? */}
                                <FormControl value={problem.weight} type='number' min={0} onChange={onFormChangeProblemIndex('weight')}/>
                            </FormGroup>
                            <FormGroup as={Col} controlId={`attempts${count}`}>
                                <FormLabel>Maximum Attempts:</FormLabel>
                                {/* Should this be a range? */}
                                <FormControl value={problem.maxAttempts} type='number' min={0} onChange={onFormChangeProblemIndex('maxAttempts')}/>
                            </FormGroup>
                            <FormGroup as={Col} controlId={`optional${count}`}>
                                <FormCheck label='Optional?' checked={problem.optional} type='checkbox' onChange={onFormChangeProblemIndex('optional')}/>
                            </FormGroup>
                        </Row>    
                    </div>
                )}
            </Draggable>
        );
    };

    const onTopicMetadataChange = (e: any, name: keyof NewCourseTopicObj) => {
        const val = e.target.value;
        console.log(`updating ${name} to ${val}`);
        switch (name) {
        case 'startDate':
        case 'endDate': {
            let date = moment(val);
            setTopicMetadata({...topicMetadata, [name]: date.toDate()});
            break;
        }
        default:
            setTopicMetadata({...topicMetadata, [name]: val});
        }
        console.log(topicMetadata);
    };

    const onDrop = useCallback(acceptedFiles => {
        // TODO: Here, we should upload the DEF file to the server, and then move to the next page.
        console.log(acceptedFiles);
        (async () => {
            const data = new FormData();
            data.append('def-file', acceptedFiles[0]);
            const res = await AxiosRequest.post('/courses/def', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const topicData = res?.data;
            console.log(topicData);
            if (!topicData) {
                console.error('Invalid DEF file.');
                // TODO: Display error.
                return false;
            }
            console.log(topicData.problems);
            // We have to massage the old DEF format into a new ProblemObject.
            // When we import the DEF parser to the frontend, we'll move this logic there.
            const problems = topicData.problems.map((prob: any, index: number) => {
                const newProb = new ProblemObject(prob);
                newProb.webworkQuestionPath = prob.source_file;
                newProb.weight = prob.value;
                newProb.problemNumber = index;
                // TODO: is counts_parent_grade the same as optional?
                return newProb;
            });
            console.log(problems);
            setProblems(problems);
        })();
    }, []);
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop});

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const problemsWithOrdering = problems.map((problem, index) => {
            // Problems should always render in the order that the professor sets them.
            problem.problemNumber = index;

            // If the base path is present, this is already a full path and should escape further processing.
            if (_.startsWith(problem.webworkQuestionPath, webworkBasePath)) {
                return problem;
            }

            problem.webworkQuestionPath = problem.webworkQuestionPath.replace(/^Library/,'OpenProblemLibrary');
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
        addTopic(unitIndex, existingTopic, new NewCourseTopicObj({...topicMetadata, questions: problemsWithOrdering}));
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) {
            return;
        }
    
        if (result.destination.index === result.source.index) {
            return;
        }

        const reorder = (list: Array<any>, startIndex: number, endIndex: number) => {
            const result = Array.from(list);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
          
            return result;
        };
        let newProbs = reorder(problems, result.source.index, result.destination.index);
        newProbs = newProbs.map((prob, i) => {
            prob.problemNumber = i;
            return prob;
        });
        console.log(newProbs);
        setProblems(newProbs);
    };

    return (
        <Form
            onSubmit={handleSubmit}
            {...getRootProps()}
            onClick={()=>{}}
            style={isDragActive ? {backgroundColor: 'red'} : {}}>
            <Modal.Header closeButton>
                <h3>{existingTopic ? `Editing: ${existingTopic.name}` : 'Add a Topic'}</h3>
            </Modal.Header>
            <Modal.Body style={{minHeight: `${24 + (problems.length * 19)}vh`}}>
                <input type="file" {...getInputProps()} />
                <h6>Add questions to your topic, or import a question list by dragging in a DEF file.</h6>
                <FormGroup as={Row} controlId='topicTitle' onClick={(e : any) => {e.preventDefault(); e.stopPropagation();}}>
                    <Form.Label column sm="2">Topic Title:</Form.Label>
                    <Col sm="10">
                        <FormControl
                            required
                            onChange={(e: any) => onTopicMetadataChange(e, 'name')} 
                            defaultValue={topicMetadata?.name}
                        />
                    </Col>
                </FormGroup>
                <Row>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Col>
                            <DateTimePicker 
                                variant='inline'
                                label='Start date'
                                name={'start'}
                                value={topicMetadata.startDate}
                                onChange={() => {}}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    const e = {target: {value: date.toDate()}};
                                    onTopicMetadataChange(e, 'startDate');
                                }}
                                fullWidth={true}
                                InputLabelProps={{shrink: false}}
                                inputProps={{style: {textAlign: 'center'}}}
                                defaultValue={moment(topicMetadata?.startDate).format('YYYY-MM-DD')}
                            />
                        </Col>
                        <Col>
                            <DateTimePicker 
                                variant='inline'
                                label='End date'
                                name={'end'}
                                value={topicMetadata.endDate}
                                onChange={() => {}}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    const e = {target: {value: date.toDate()}};
                                    onTopicMetadataChange(e, 'endDate');
                                }}
                                fullWidth={true}
                                InputLabelProps={{shrink: false}}
                                inputProps={{style: {textAlign: 'center'}}}
                                defaultValue={moment(topicMetadata?.endDate).format('YYYY-MM-DD')}
                            />
                        </Col>
                    </MuiPickersUtilsProvider>
                </Row>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId='problemsList'>
                        {
                            (provided) => (
                                <div ref={provided.innerRef} style={{backgroundColor: 'white'}} {...provided.droppableProps}>
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
                <Button variant="secondary" onClick={
                    // FIXME: We're using random IDs to get this working right now because problems aren't created with real ids.
                    () => setProblems([...problems, new ProblemObject({problemNumber: problems.length, id: -Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)})])
                }>Add Another Question</Button>
                <Button 
                    variant="primary" 
                    type='submit'
                    disabled={problems.length <= 0}
                >Finish</Button>
            </Modal.Footer>
        </Form>
    );
};

export default TopicCreationModal;
