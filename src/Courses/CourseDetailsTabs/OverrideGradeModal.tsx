import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import _ from 'lodash';
import { StudentGrade } from '../CourseInterfaces';

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
    const onHide = () => {
        onHideProp();
    };
    
    const displayScore = (grade.effectiveScore * 100).toFixed(1);
    return (
        <Modal
            show={show}
            onHide={onHide}
        >
            <Modal.Header closeButton>
                <h6>Override Grade</h6>
            </Modal.Header>
            <Modal.Body>
                The student currently has a {displayScore}!
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
    );
};