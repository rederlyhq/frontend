import React, { useState } from 'react';
import { useCallback } from 'react';
import { Modal, ModalTitle, ModalBody, Form, Button, ModalFooter, Alert } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/ModalHeader';
import BackendAPIError from '../../APIInterfaces/BackendAPI/BackendAPIError';
import { enrollStudent } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { SimpleFormRow } from '../../Components/SimpleFormRow';
import useAlertState from '../../Hooks/useAlertState';
import logger from '../../Utilities/Logger';
import { UserObject } from '../CourseInterfaces';

interface AddEnrollmentModalProps {
    show: boolean;
    onClose: () => void;
    courseId: number;
    onEnrollment: (user: UserObject) => void;
}

/**
 * This modal pops up with a form to email students.
 * The users that are emailed are chosen on another screen.
 */
export const AddEnrollmentModal: React.FC<AddEnrollmentModalProps> = ({
    show,
    onClose: onCloseProp,
    courseId,
    onEnrollment
}) => {
    const [validated, setValidated] = useState(false);
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useAlertState();
    const [loading, setLoading] = useState(false);

    const onClose = useCallback(() => {
        setEmail('');
        setValidated(false);
        setAlert({message: '', variant: 'info'});
        onCloseProp();
        setLoading(false);
    }, [onCloseProp]);

    const onSubmit = async () => {
        setAlert({message: '', variant: 'info'});
        try {
            setLoading(true);
            const results = await enrollStudent({
                studentEmail: email,
                courseId: courseId
            });
            onEnrollment(results.data.data.user);
            setAlert({message: 'Success', variant: 'success'});
            setTimeout(() => {
                onClose();
            }, 3000);
        } catch (e) {
            const msg = e.message;
            if (!(e instanceof BackendAPIError && e.status === 400)) {
                logger.error(`AddEnrollmentModal request failed with status ${e.status}`, e);
            }
            setLoading(false);
            setAlert({message: msg, variant: 'danger'});
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            onSubmit();
        }
  
        setValidated(true);
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <ModalHeader closeButton>
                    <ModalTitle>Enroll Student</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Alert variant={alert.variant} show={Boolean(alert.message)}>{alert.message}</Alert>
                    <SimpleFormRow
                        id="enrollStudentEmail"
                        label="Student Institutional Email Address"
                        errmsg="An Institutional email address is required."
                        required
                        defaultValue='' 
                        name="enrollStudentEmail" 
                        autoComplete="email" 
                        type="email" 
                        placeholder="cxavier@xavierinstitute.edu"
                        onChange={(e: any) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        variant="primary"
                        disabled={loading}
                        type='submit'
                    >
                            Enroll Student
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};
