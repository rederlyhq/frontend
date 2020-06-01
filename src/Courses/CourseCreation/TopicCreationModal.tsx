import React, { useState } from 'react';
import { FormControl, FormLabel, Form, FormGroup, Modal, Button, InputGroup, Col, Row, FormCheck } from 'react-bootstrap';
import _ from 'lodash';
import { TopicObject, ProblemObject, NewCourseTopicObj } from '../CourseInterfaces';
import moment from 'moment';

interface TopicCreationModalProps {
    unit: number;
    addTopic: (unit: number, existingTopic: TopicObject | null | undefined, topic: TopicObject) => void;
    existingTopic?: TopicObject;
}

/**
 * Topics are either a list of problems/weights, or a DEF file.
 * 
 */
export const TopicCreationModal: React.FC<TopicCreationModalProps> = ({unit,  addTopic, existingTopic}) => {
    const [topicMetadata, setTopicMetadata] = useState<NewCourseTopicObj>(new NewCourseTopicObj(existingTopic));
    const [problems, setProblems] = useState<Array<ProblemObject>>(existingTopic ? existingTopic.questions : []);
    const webworkBasePath = 'webwork-open-problem-library/';

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
            probs[index].webworkQuestionPath = _.trimStart(val, webworkBasePath);
            break;
        case 'weight':
        case 'maxAttempts':
        case 'problemNumber':
            probs[index][name] = parseInt(val, 10);
            break;
        default:
            probs[index][name] = val;
        }

        setProblems(probs);
    };

    const addProblemRows = (problem: ProblemObject, count: number) => {
        const onFormChangeProblemIndex = _.curry(onFormChange)(count);
        return (
            <div key={`problem-row-${count}`}>
                <FormGroup controlId={`problem${count}`}>
                    <FormLabel>Problem Path:</FormLabel>
                    {/* This might be a nice UI addition, but might be annoying if we don't autoremove a duplicate. */}
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>{webworkBasePath}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl required value={problem.webworkQuestionPath} onChange={onFormChangeProblemIndex('webworkQuestionPath')}/>
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

    return (
        <Form 
            action='#'
            onSubmit={() => addTopic(unit, existingTopic, new TopicObject({...topicMetadata, questions: problems}))}>
            <Modal.Header closeButton>
                <h3>{existingTopic ? `Editing: ${existingTopic.name}` : 'Add a Topic'}</h3>
            </Modal.Header>
            <Modal.Body>
                <h6>Add questions to your topic, or import a question list from a DEF file.</h6>
                <FormGroup as={Row} controlId='topicTitle'>
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
                    <FormGroup as={Col} controlId='start'>
                        <FormLabel>
                            <h4>Start Date:</h4>
                        </FormLabel>
                        <FormControl 
                            required
                            type='date' 
                            onChange={(e: any) => onTopicMetadataChange(e, 'startDate')}
                            defaultValue={moment(topicMetadata?.startDate).format('YYYY-MM-DD')}
                        />
                    </FormGroup>
                    <FormGroup as={Col} controlId='end'>
                        <FormLabel>
                            <h4>End Date:</h4>
                        </FormLabel>
                        <FormControl 
                            required
                            type='date' 
                            onChange={(e: any) => onTopicMetadataChange(e, 'endDate')}
                            defaultValue={moment(topicMetadata?.endDate).format('YYYY-MM-DD')}
                        />
                    </FormGroup>
                </Row>
                { problems.map(addProblemRows) }
            </Modal.Body>
            <Modal.Footer>
                {/* Do we need a cancel button in the Modal? You can click out and click the X. */}
                {/* <Button variant="danger" className="float-left">Cancel</Button> */}
                <Button variant="secondary" onClick={() => setProblems([...problems, new ProblemObject()])}>Add Another Question</Button>
                <Button 
                    variant="primary" 
                    type='submit'
                >Finish</Button>
            </Modal.Footer>
        </Form>
    );
};

export default TopicCreationModal;