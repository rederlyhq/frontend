import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Form, FormControl, FormGroup, FormLabel, Modal } from 'react-bootstrap';
import _ from 'lodash';
import { StudentGrade } from '../CourseInterfaces';
import { putQuestionGrade } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import useAlertState from '../../Hooks/useAlertState';
import logger from '../../Utilities/Logger';

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
    onSuccess: (newGrade: Partial<StudentGrade>) => void;
}

export const OverrideGradeModal: React.FC<OverrideGradeModalProps> = ({
    show,
    onHide: onHideProp,
    grade,
    onSuccess
}) => {
    const displayCurrentScore = useRef<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    if(_.isNil(displayCurrentScore.current) && show) {
        displayCurrentScore.current = (grade.effectiveScore * 100).toFixed(1);
    }
    const [alertState, setAlertState] = useAlertState();
    const [overrideGradePhase, setOverrideGradePhase] = useState<OverrideGradePhase>(OverrideGradePhase.PROMPT);
    const [validated, setValidated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [newScorePercentInput, setNewScorePercentInput] = useState<string>(displayCurrentScore.current ?? '');

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.select();
        }
    // inputRef.current is set to a new value every time the dialog comes up
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputRef.current]);

    useEffect(() => {
        // This is to handle the case where you change grades that were the same value or you canceled a change and went back in
        // The grade does not change when hidden, however when it comes back up it should update
        // Figured while it is hidden when can empty that value
        if (!show) {
            setNewScorePercentInput('');
        } else if(!_.isNil(displayCurrentScore.current)) {
            setNewScorePercentInput(displayCurrentScore.current);
        }
    }, [displayCurrentScore.current, show]);

    const onHide = () => {
        displayCurrentScore.current = null;
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
        const newScore = parseFloat(newScorePercentInput) / 100;
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
        const newScore = parseFloat(newScorePercentInput) / 100;
        setLoading(true);
        try {
            if (_.isNil(grade.id)) {
                throw new Error('Application error: grade missing');
            }
            const result = await putQuestionGrade({
                id: grade.id,
                data: {
                    effectiveScore: newScore
                }
            });
            onSuccess(result.data.data.updatesResult.updatedRecords[0]);
        } catch (e) {
            setAlertState({
                variant: 'danger',
                message: e.message
            });
            setLoading(false);
            return;
        }
        setLoading(false);
        if (!grade.locked && newScore < grade.effectiveScore) {
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
            const result = await putQuestionGrade({
                id: grade.id,
                data: {
                    locked: true
                }
            });
            onSuccess(result.data.data.updatesResult.updatedRecords[0]);
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
                    {(() => {
                        switch(overrideGradePhase) {
                        case OverrideGradePhase.PROMPT:
                            return (
                                <>
                                    <p>The student currently has a score of <strong>{displayCurrentScore.current}</strong> on this problem.</p>
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
                                            step={0.1}
                                            min={0}
                                            max={100}
                                            onChange={onNewScoreChange}
                                            // Can't use a function here to use it directly since it get's called on all inputs
                                            // which causes the text to highlight and erase as you type
                                            ref={inputRef}
                                        />
                                        <Form.Control.Feedback type="invalid">{<span>The new score must be a positive number between 0 and 100</span>}</Form.Control.Feedback>
                                    </FormGroup>
                                </>
                            );
                        case OverrideGradePhase.CONFIRM:
                            return (
                                <p>Are you sure you want to update the student&apos;s grade from <strong>{displayCurrentScore.current}</strong> to <strong>{newScorePercentInput}</strong>.</p>
                            );
                        case OverrideGradePhase.LOCK:
                            return (
                                <p>
                                    You have reduced the student&apos;s grade from <strong>{displayCurrentScore.current}</strong> to <strong>{newScorePercentInput}</strong>.
                                    <br/>
                                    Since you have reduced the student&apos;s grade would you like to lock it as well? This will prevent the student from trying again and getting a better grade.
                                </p>
                            );
                        case OverrideGradePhase.LOCK_CONFIRM:
                            return (
                                <p>
                                    Are you sure you want to lock the student&apos;s grade? The student will no longer be able to update their grade until unlocked.
                                </p>
                            );
                        default:
                            logger.error(`APPLICAION ERROR: no body for OverrideGradePhase ${overrideGradePhase}`);
                        }

                    })()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        {(() => {
                            switch(overrideGradePhase) {
                            case OverrideGradePhase.PROMPT:
                            case OverrideGradePhase.CONFIRM:
                                return 'Cancel';
                            case OverrideGradePhase.LOCK:
                                return 'Close';
                            case OverrideGradePhase.LOCK_CONFIRM:
                                return 'Cancel Lock';
                            default:
                                logger.error(`APPLICAION ERROR: no cancel for OverrideGradePhase ${overrideGradePhase}`);
                                return 'Exit';
                            }
                        })()}
                    </Button>
                    {(() => {
                        switch(overrideGradePhase) {
                        case OverrideGradePhase.PROMPT:
                            return (
                                <Button
                                    variant="primary"
                                    type="submit"
                                    // The input gets focus instead of the button
                                    // ref={(ref: HTMLButtonElement | null) => ref?.focus()}
                                    aria-describedby="Override grade"
                                >
                                        Submit
                                </Button>
                            );
                        case OverrideGradePhase.CONFIRM:
                            return (
                                <Button variant="primary"
                                    onClick={overrideGradeConfirm}
                                    ref={(ref: HTMLButtonElement | null) => ref?.focus()}
                                    aria-describedby="Confirm grade override"
                                >
                                    Confirm
                                </Button>
                            );
                        case OverrideGradePhase.LOCK:
                            return (
                                <Button
                                    variant="danger"
                                    onClick={lockSubmit}
                                    ref={(ref: HTMLButtonElement | null) => ref?.focus()}
                                    aria-describedby="Lock grade"
                                >
                                    Lock
                                </Button>
                            );
                        case OverrideGradePhase.LOCK_CONFIRM:
                            return (
                                <Button
                                    variant="primary"
                                    onClick={lockConfirm}
                                    ref={(ref: HTMLButtonElement | null) => ref?.focus()}
                                    aria-describedby="Confirm locked grade"
                                >
                                    Confirm
                                </Button>
                            );
                        default:
                            logger.error(`APPLICAION ERROR: no body for OverrideGradePhase ${overrideGradePhase}`);
                            return;
                        }
                    })()}
                </Modal.Footer>
            </Form>
        </Modal>
    );
};