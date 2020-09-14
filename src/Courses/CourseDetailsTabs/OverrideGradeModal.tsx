import React, { useState, useEffect } from 'react';
import { Alert, Button, Form, FormControl, FormGroup, FormLabel, Modal } from 'react-bootstrap';
import _ from 'lodash';
import { StudentGrade } from '../CourseInterfaces';
import { putQuestionGrade } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import useAlertState from '../../Hooks/useAlertState';

enum OverrideGradePhase {
    PROMPT = 'PROMPT',
    CONFIRM = 'CONFIRM',
    LOCK = 'LOCK',
    LOCK_CONFIRM = 'LOCK_CONFIRM',
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
    const [alertState, setAlertState] = useAlertState();
    const [overrideGradePhase, setOverrideGradePhase] = useState<OverrideGradePhase>(OverrideGradePhase.PROMPT);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const displayCurrentScore = (grade.effectiveScore * 100).toFixed(1);
    const [newScorePercentInput, setNewScorePercentInput] = useState<string>(displayCurrentScore);

    useEffect(() => {
        setNewScorePercentInput(displayCurrentScore);
    }, [displayCurrentScore]);

    const onHide = () => {
        onHideProp();
        // There is a small flicker while it animates that setTimeout hides
        setTimeout(() => {
            setOverrideGradePhase(OverrideGradePhase.PROMPT);
            setValidated(false);
            setLoading(false);
            // setNewScorePercentInput should be updated in setEffect because it value should default to the student grade
        });
    };

    const onNewScoreChange = (ev: React.ChangeEvent<HTMLInputElement>): void => setNewScorePercentInput(ev.target.value);

    const overrideGradeSubmit = () => {
        const newScore = parseInt(newScorePercentInput, 10) / 100;
        if (newScore === grade.effectiveScore) {
            onHide();
        } else {
            setOverrideGradePhase(OverrideGradePhase.CONFIRM);
        }
    };

    const overrideGradeConfirm = async () => {
        setAlertState({
            variant: 'danger',
            message: ''
        });
        const newScore = parseInt(newScorePercentInput, 10) / 100;
        setLoading(true);
        try {
            if (_.isNil(grade.id)) {
                throw new Error('Application error: grade missing');
            }
            // Do we want to do anything with the response
            await putQuestionGrade({
                id: grade.id,
                data: {
                    effectiveScore: newScore
                }
            });
        } catch (e) {
            setAlertState({
                variant: 'danger',
                message: e.message
            });
            setLoading(false);
            return;
        }
        setLoading(false);
        if (newScore < grade.effectiveScore) {
            setOverrideGradePhase(OverrideGradePhase.LOCK);
        } else {
            onHide();
        }
    };

    const lockSubmit = () => {
        setOverrideGradePhase(OverrideGradePhase.LOCK_CONFIRM);
    };

    const lockConfirm = async () => {
        setLoading(true);
        try {
            if (_.isNil(grade.id)) {
                throw new Error('Application error: grade missing');
            }
            // Do we want to do anything with the response
            await putQuestionGrade({
                id: grade.id,
                data: {
                    locked: true
                }
            });
        } catch (e) {
            setAlertState({
                variant: 'danger',
                message: e.message
            });
            setLoading(false);
            return;
        }
        setLoading(false);
        onHide();
    };

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            overrideGradeSubmit();
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
                    {(alertState.message !== '') && <Alert variant={alertState.variant}>{alertState.message}</Alert>}
                    {overrideGradePhase === OverrideGradePhase.PROMPT &&
                    <>
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
                                // TODO should we put a max or is it a feature if there is no max
                                // max={100}
                                onChange={onNewScoreChange}
                            />
                            <Form.Control.Feedback type="invalid">{<span>The new score must be a postive number between 0 and 100</span>}</Form.Control.Feedback>
                        </FormGroup>
                    </>
                    }
                    
                    {overrideGradePhase === OverrideGradePhase.CONFIRM &&
                        <p>Are you sure you want to update the student&apos;s grade from <strong>{displayCurrentScore}</strong> to <strong>{newScorePercentInput}</strong>.</p>
                    }

                    {overrideGradePhase === OverrideGradePhase.LOCK &&
                        <p>
                            You have reduced the student&apos;s grade from <strong>{displayCurrentScore}</strong> to <strong>{newScorePercentInput}</strong>.
                            <br/>
                            Since you have reduced the student&apos;s grade would you like to lock it as well? This will prevent the student from trying again and getting a better grade.
                        </p>
                    }

                    {overrideGradePhase === OverrideGradePhase.LOCK_CONFIRM &&
                        <p>
                            Are you sure you want to lock the student&apos;s grade? The student will no longer be able to update their grade until unlocked.
                        </p>
                    }
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
                    {overrideGradePhase === OverrideGradePhase.CONFIRM &&
                    <>
                        <Button variant="primary" onClick={overrideGradeConfirm}>
                            Confirm
                        </Button>
                    </>
                    }
                    {overrideGradePhase === OverrideGradePhase.LOCK &&
                    <>
                        <Button variant="danger" onClick={lockSubmit}>
                            Lock
                        </Button>
                    </>
                    }
                    {overrideGradePhase === OverrideGradePhase.LOCK_CONFIRM &&
                    <>
                        <Button variant="primary" onClick={lockConfirm}>
                            Confirm
                        </Button>
                    </>
                    }
                </Modal.Footer>
            </Form>
        </Modal>
    );
};