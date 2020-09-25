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
    confirmVariant?: | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'dark'
    | 'light'
    | 'link'
    | 'outline-primary'
    | 'outline-secondary'
    | 'outline-success'
    | 'outline-danger'
    | 'outline-warning'
    | 'outline-info'
    | 'outline-dark'
    | 'outline-light';
}

export const ConfirmationModal: React.FC<ComponentToggleButtonProps> = ({
    show,
    onHide,
    headerContent = 'Are you sure?',
    bodyContent = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'primary',
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
                <Button variant={confirmVariant} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
