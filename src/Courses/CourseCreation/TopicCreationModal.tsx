import React, { useState } from 'react';
import ButtonAndModal from '../../Components/ButtonAndModal';
import { FormControl, FormLabel, Form, FormGroup, Modal, FormText, Button, InputGroup, Col, Row } from 'react-bootstrap';
import _ from 'lodash';
import { IProblemObject, TopicObject, ProblemObject } from '../CourseInterfaces';

interface TopicCreationModalProps {
    unit: number;
    addTopic: (unit: number, topic: TopicObject) => void;
}

/**
 * Topics are either a list of problems/weights, or a DEF file.
 * 
 */
export const TopicCreationModal: React.FC<TopicCreationModalProps> = ({unit,  addTopic}) => {
    const [title, setTitle] = useState<string>('');
    const [problems, setProblems] = useState<Array<ProblemObject>>([]);
    const webworkBasePath = 'webwork-open-problem-library/OpenProblemLibrary/';

    /**
     * Handles state for input for each problem.
     * @param isPath - A boolean for whether this is a path or a weight. If the
     *                 problem requires more rows, this should become a switch.
     * @param index  - The index of the FormGroup generated.
     * @param e      - The event object.
     * */
    const onFormChange = (isPath: boolean, index: number, e: any) => {
        let val = e.target.value;
        let probs = [...problems];

        // TODO: Handle validation.
        if (isPath) {
            probs[index].webworkQuestionPath = _.trimStart(val, webworkBasePath);
        } else {
            probs[index].weight = parseInt(val, 10);
        }

        setProblems(probs);
    };

    const addProblemRows = (problem: ProblemObject, count: number) => {
        return (
            <div key={`problem-row-${count}`}>
                <FormGroup controlId={`problem${count}`}>
                    <FormLabel>Problem Path:</FormLabel>
                    {/* This might be a nice UI addition, but might be annoying if we don't autoremove a duplicate. */}
                    <InputGroup>
                        <InputGroup.Prepend>
                            <InputGroup.Text>{webworkBasePath}</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl value={problem.webworkQuestionPath} onChange={(e: any) => onFormChange(true, count, e)}/>
                    </InputGroup>
                </FormGroup>
                <FormGroup controlId={`weight${count}`}>
                    <FormLabel>Problem Weight:</FormLabel>
                    {/* Should this be a range? */}
                    <FormControl value={problem.weight} type='number' onChange={(e: any) => onFormChange(false, count, e)}/>
                </FormGroup>
            </div>
        );
    };

    return (
        <>
            <Modal.Header closeButton>
                <h3>Add a Topic</h3>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <h6>Add questions to your topic, or import a question list from a DEF file.</h6>
                    <FormGroup as={Row} controlId='topicTitle'>
                        <Form.Label column sm="2">Topic Title:</Form.Label>
                        <Col sm="10">
                            <FormControl onChange={(e: any) => setTitle(e?.target?.value)}/>
                        </Col>
                    </FormGroup>
                    { problems.map(addProblemRows) }
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" className="float-left">Cancel</Button>
                <Button variant="secondary" onClick={() => setProblems([...problems, new ProblemObject()])}>Add Another Question</Button>
                <Button variant="primary" onClick={() => addTopic(unit, new TopicObject({name: title, questions: problems}))}>Finish</Button>
            </Modal.Footer>
        </>
    );
};

export default TopicCreationModal;