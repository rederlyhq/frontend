import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface loginProps {
    header: string;
    buttonText: string;
    stopProp?: boolean;
    [x: string]: any;
}

/**
 * This component renders a button, and displays a Modal to log in with it.
 * @param header - Text to show in Button and Modal Header
 * @param children - Content to render in Modal Body
 * 
 * Note: React-Bootstrap 1.0.0 throws a warning for deprecated usage of findDOMNode.
 *       This issue is being tracked here: https://github.com/react-bootstrap/react-bootstrap/issues/5075
 */
export const ButtonAndModal: React.FC<loginProps> = ({children, header, buttonText, stopProp, ...props}) => {
    const [showModal, setShowModal] = useState(false);

    const callShowModal = (show: boolean, e: any = null) => {
        if (stopProp && e != null) {
            e.stopPropagation();
            e.preventDefault();
        }
        setShowModal(show);
    };

    return (
        <>
            <Button className="button-margin" onClick={(e: any) => callShowModal(true, e)} {...props}>{buttonText || header}</Button>
            <Modal show={showModal} onHide={() => callShowModal(false)}>
                <Modal.Header closeButton>
                    {header}
                </Modal.Header>
                <Modal.Body>
                    {children}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ButtonAndModal;