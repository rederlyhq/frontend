import React, { useState } from 'react';
import { Button, Form, FormControl, FormGroup, FormLabel, Modal } from 'react-bootstrap';
import _ from 'lodash';
import { StudentGrade } from '../CourseInterfaces';

enum OverrideGradePhase {
    PROMPT = 'PROMPT',
    CONFIRM = 'CONFIRM',
    LOCK = 'LOCK'
}
interface OverrideGradeModalProps {
    show: boolean;
    onHide: () => void;
    grade: StudentGrade;
}

export const OverrideGradeModal: React.FC<OverrideGradeModalProps> = ({
    show,
    onHide: onHideProp,
    grade
}) => {
    const [overrideGradePhase, setOverrideGradePhase] = useState<OverrideGradePhase>(OverrideGradePhase.PROMPT);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const displayCurrentScore = (grade.effectiveScore * 100).toFixed(1);
    const [newScorePercentInput, setNewScorePercentInput] = useState<string>(displayCurrentScore);
    const onHide = () => {
        setOverrideGradePhase(OverrideGradePhase.PROMPT);
        onHideProp();
    };

    const onNewScoreChange = (ev: React.ChangeEvent<HTMLInputElement>): void => setNewScorePercentInput(ev.target.value);

    const overrideGrade = () => {
        const newScore = parseInt(newScorePercentInput, 10) / 100;
        if (newScore === grade.effectiveScore) {
            onHide();
        }
    };

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            overrideGrade();
        }
  
        setValidated(true);
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
        >
            <Modal.Header closeButton>
                <h6>Override Grade</h6>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={onSubmit}>

                <Modal.Body>
                    <p>The student currently has a score of <strong>{displayCurrentScore}</strong> on this problem.</p>
                    <FormGroup controlId='override-score'>
                        <FormLabel>
                                New score:
                        </FormLabel>
                        <FormControl
                            required
                            value={newScorePercentInput}
                            size='lg'
                            readOnly={loading}
                            type='number'
                            min={0}
                            max={100}
                            onChange={onNewScoreChange}
                        />
                        <Form.Control.Feedback type="invalid">{<span>The new score must be a postive number between 0 and 100</span>}</Form.Control.Feedback>
                    </FormGroup>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                            Cancel
                    </Button>
                    {overrideGradePhase === OverrideGradePhase.PROMPT &&
                    <>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </>
                    }
                    {overrideGradePhase === OverrideGradePhase.LOCK &&
                    <>
                        <Button variant="danger" type="submit">
                            Lock
                        </Button>
                    </>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    );
};