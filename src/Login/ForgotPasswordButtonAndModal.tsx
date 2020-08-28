import React, { useState } from 'react';
import { Form, Button, Alert, Modal } from 'react-bootstrap';
import AxiosRequest from '../Hooks/AxiosRequest';
import useAlertState from '../Hooks/useAlertState';
import _ from 'lodash';

interface ForgotPasswordButtonAndModalProps {
    defaultEmail?: string;
    onComplete?: () => void;
}

type ForgotPasswordFormData = {
    email: string;
}

export const ForgotPasswordButtonAndModal: React.FC<ForgotPasswordButtonAndModalProps> = ({
    defaultEmail = '',
    onComplete
}) => {
    const [validated, setValidated] = useState(false);
    const [{ message: forgotPasswordAlertMsg, variant: forgotPasswordAlertType }, setForgotPasswordAlertMsg] = useAlertState();
    const [formState, setFormState] = useState<ForgotPasswordFormData>({ email: defaultEmail });
    const [showModal, setShowModal] = useState(false);

    const callShowModal = (show: boolean, e: any = null) => {
        if (e != null) {
            e.stopPropagation();
            e.preventDefault();
        }
        setShowModal(show);
    };

    const handleForgotPassword = () => {
        setForgotPasswordAlertMsg({
            message: 'Forgot password email sent successfully!',
            variant: 'success'
        });
        setTimeout(() => {
            callShowModal(false);
            onComplete?.();
        }, 3000);
    };

    const handleNamedChange = (name: keyof ForgotPasswordFormData, event: any) => {
        if (name !== event.target.name) {
            console.error(`Mismatched event, ${name} is on ${event.target.name}`);
        }
        const val = event.target.value;
        setFormState({ ...formState, [name]: val });
    };

    const handleSubmit = (event: any) => {
        console.log(event);
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            console.log(form);
            handleForgotPassword();
        }

        setValidated(true);
    };

    return (
        <>
            <Button variant="link" className="button-margin" onClick={(e: any) => callShowModal(true, e)}>Forgot Password</Button>
            <Modal show={showModal} onHide={() => callShowModal(false)}>
                <Modal.Header closeButton>
                    ForgotPassword
                </Modal.Header>
                <Modal.Body>
                    <Form noValidate validated={validated} onSubmit={handleSubmit} action='#'>
                        <Form.Group controlId="institutionalEmail">
                            {(forgotPasswordAlertMsg !== '') && <Alert variant={forgotPasswordAlertType}>{forgotPasswordAlertMsg}</Alert>}
                            <Form.Label>Institutional Email Address</Form.Label>
                            <Form.Control
                                required
                                defaultValue={defaultEmail}
                                name="email"
                                autoComplete="username"
                                type="email"
                                placeholder="cxavier@xavierinstitute.edu"
                                onChange={_.partial(handleNamedChange, 'email')}
                            />
                            <Form.Control.Feedback type="invalid">{<span>An Institutional is required.</span>}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group>
                            <Button type="submit">Submit</Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};
