import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface ComponentToggleButtonProps {
    show: boolean;
    onHide: () => unknown;
    headerContent?: JSX.Element | string;
    bodyContent?: JSX.Element | string;
    onConfirm: () => unknown;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal: React.FC<ComponentToggleButtonProps> = ({
    show,
    onHide,
    headerContent = 'Are you sure?',
    bodyContent = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm
}) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
        >
            <Modal.Header>
                {headerContent}
            </Modal.Header>
            <Modal.Body>
                {bodyContent}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    {cancelText}
                </Button>
                <Button variant="primary" onClick={onConfirm}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
