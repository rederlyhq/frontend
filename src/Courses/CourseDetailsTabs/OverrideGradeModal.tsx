import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import _ from 'lodash';

interface OverrideGradeModalProps {
    show: boolean;
    onHide: () => void;
}
export const OverrideGradeModal: React.FC<OverrideGradeModalProps> = ({
    show,
    onHide: onHideProp
}) => {
    const onHide = () => {
        onHideProp();
    };
    
    return (
        <Modal
            show={show}
            onHide={onHide}
        >
            <Modal.Header closeButton>
                <h6>Override Grade</h6>
            </Modal.Header>
            <Modal.Body>
                Are you sure you would like to override the grade?
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