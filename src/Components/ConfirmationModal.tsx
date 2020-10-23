import React from 'react';
import { Modal, Button } from 'react-bootstrap';

type ModalVariant = 'primary'
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

export interface ConfirmationModalProps {
    show: boolean;
    onHide: () => unknown;
    headerContent?: JSX.Element | string;
    bodyContent?: JSX.Element | string;
    onConfirm: () => unknown;
    onSecondary?: () => unknown;
    confirmText?: string;
    cancelText?: string;
    confirmDisabled?: boolean;
    secondaryDisabled?: boolean;
    confirmVariant?: ModalVariant;
    secondaryVariant?: ModalVariant;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    show,
    onHide,
    headerContent = 'Are you sure?',
    bodyContent = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'primary',
    secondaryVariant = 'secondary',
    confirmDisabled = false,
    secondaryDisabled = false,
    onConfirm,
    onSecondary
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
                <Button disabled={secondaryDisabled} variant={secondaryVariant} onClick={onSecondary ?? onHide}>
                    {cancelText}
                </Button>
                <Button disabled={confirmDisabled} variant={confirmVariant} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
