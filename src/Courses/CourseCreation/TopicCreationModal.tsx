import React, { useState } from 'react';
import { FormControl, FormLabel, Form, FormGroup, Modal, FormText, Button, InputGroup, Col, Row, FormCheck } from 'react-bootstrap';
import _ from 'lodash';
import { TopicObject, ProblemObject } from '../CourseInterfaces';

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
    const [title, setTitle] = useState<string>(existingTopic ? existingTopic.name : '');
    const [problems, setProblems] = useState<Array<ProblemObject>>(existingTopic ? existingTopic.questions : []);
    const webworkBasePath = 'webwork-open-problem-library/OpenProblemLibrary/';

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
                        <FormControl value={problem.webworkQuestionPath} onChange={onFormChangeProblemIndex('webworkQuestionPath')}/>
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

    return (
        <>
            <Modal.Header closeButton>
                <h3>{existingTopic ? `Editing: ${existingTopic.name}` : 'Add a Topic'}</h3>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <h6>Add questions to your topic, or import a question list from a DEF file.</h6>
                    <FormGroup as={Row} controlId='topicTitle'>
                        <Form.Label column sm="2">Topic Title:</Form.Label>
                        <Col sm="10">
                            <FormControl onChange={(e: any) => setTitle(e?.target?.value)} defaultValue={existingTopic?.name}/>
                        </Col>
                    </FormGroup>
                    { problems.map(addProblemRows) }
                </Form>
            </Modal.Body>
            <Modal.Footer>
                {/* Do we need a cancel button in the Modal? You can click out and click the X. */}
                {/* <Button variant="danger" className="float-left">Cancel</Button> */}
                <Button variant="secondary" onClick={() => setProblems([...problems, new ProblemObject()])}>Add Another Question</Button>
                <Button 
                    variant="primary" 
                    onClick={() => addTopic(unit, existingTopic, new TopicObject({name: title, questions: problems}))}
                >Finish</Button>
            </Modal.Footer>
        </>
    );
};

export default TopicCreationModal;