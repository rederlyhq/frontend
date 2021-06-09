import React, { useState } from 'react';
import { useCallback } from 'react';
import { Modal, ModalTitle, ModalBody, Form, Button, ModalFooter, Alert } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/ModalHeader';
import BackendAPIError from '../../APIInterfaces/BackendAPI/BackendAPIError';
import { enrollStudents } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { InfoContext } from '../../Components/InfoContext';
import { SimpleFormRow } from '../../Components/SimpleFormRow';
import useAlertState from '../../Hooks/useAlertState';
import logger from '../../Utilities/Logger';
import { UserObject } from '../CourseInterfaces';
import { BulkEnrollButton } from './BulkEnrollButton';
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

    const enroll = async (emails: string[]) => {
        setAlert({message: '', variant: 'info'});
        try {
            setLoading(true);
            const results = await enrollStudents({
                userEmails: emails,
                courseId: courseId
            });

            const {
                enrollments,
                pendingEnrollments,
                newlyEnrolledUsers
            } = results.data.data;
            newlyEnrolledUsers.map(user => onEnrollment(user));

            let variant = 'success';
            let pendingEnrollmentMessage = null;
            let enrollmentsMessage = null;
            if (pendingEnrollments.length > 0) {
                variant = 'warning';
                pendingEnrollmentMessage = <p><strong>{pendingEnrollments.length}</strong> of the students you enrolled have not registered with rederly yet. Upon registration they will be auto enrolled. You can see this list under pending enrollments.</p>;
            }

            if (enrollments.length > 0) {
                enrollmentsMessage = <p><strong>{enrollments.length}</strong> of the students have been successfully enrolled (or had already been enrolled).</p>;
            }

            let message = <>{pendingEnrollmentMessage}{enrollmentsMessage}</>;
            if (enrollmentsMessage === null && pendingEnrollmentMessage === null) {
                variant = 'error';
                message = <p>There were no users to enroll</p>;
            }

            setAlert({message: message, variant: variant});
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
    const onSubmit = () => {
        enroll([email]).catch(err => logger.error('TSNH: AddEnrollmentModal.onSubmit: enroll is wrapped in try catch', err));
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
                    <BulkEnrollButton onCSVProcessed={enroll} disabled={loading} />
                    <InfoContext text='This csv is only looking for the `email` column (no spaces or capitals).' />
                    <Button
                        variant="primary"
                        disabled={loading}
                        type='submit'
                        style={{marginLeft:'auto'}}
                    >
                            Enroll Student
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};
