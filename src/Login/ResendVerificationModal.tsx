import React, { useEffect, useState } from 'react';
import { Jumbotron, Modal, Button, Alert } from 'react-bootstrap';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import Axios from '../Hooks/AxiosRequest';
import _ from 'lodash';
import { postResendVerification } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import useAlertState from '../Hooks/useAlertState';

interface ResendVerificationModalProps {
    showResendVerificationModal: boolean;
    setShowResendVerificationModal: (show: boolean) => void;
    email: string;
}

export const ResendVerificationModal: React.FC<ResendVerificationModalProps> = ({
    showResendVerificationModal,
    setShowResendVerificationModal,
    email 
}) => {
    const [{ message: verificationAlertMsg, variant: verificationAlertType }, setVerificationAlertMsg] = useAlertState();
    const [success, setSuccess] = useState(false);

    const onSubmit = async () => {
        try {
            setVerificationAlertMsg({
                message: '',
                variant: 'info'
            });
            await postResendVerification({
                email
            });

            setVerificationAlertMsg({
                message: 'Verification email sent out successfully! Check your email for verification link.',
                variant: 'success'
            });
            setSuccess(true);

            setTimeout(() => {
                setVerificationAlertMsg({
                    message: '',
                    variant: 'info'
                });
                setSuccess(false);    
                setShowResendVerificationModal(false);
            }, 3000);
        } catch (e) {
            setVerificationAlertMsg({
                message: e.message,
                variant: 'danger'
            });
        }
    };
    return (
        <Modal
            show={showResendVerificationModal}
            onHide={_.partial(setShowResendVerificationModal, false)}
        >
            <Modal.Header>
                <h3>Account Not Verified</h3>
            </Modal.Header>
            <Modal.Body>
                {(verificationAlertMsg !== '') && <Alert variant={verificationAlertType}>{verificationAlertMsg}</Alert>}
                {!success && <p>This Account has not been verified. Would you like us send a new verification email?</p>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={onSubmit} disabled={success}>Submit</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ResendVerificationModal;
