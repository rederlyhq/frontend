import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import AxiosRequest from '../Hooks/AxiosRequest';
import useAlertState from '../Hooks/useAlertState';
import { useHistory } from 'react-router-dom';
import Cookie from 'js-cookie';
import { getUserRoleFromServer } from '../Enums/UserRole';
import { CookieEnum } from '../Enums/CookieEnum';
import ButtonAndModal from '../Components/ButtonAndModal';
import _ from 'lodash';

interface ForgotPasswordFormProps {
    defaultEmail?: string;
    onComplete?: () => void;
}

type ForgotPasswordFormData = {
    email: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
    defaultEmail = '',
    onComplete
}) => {
    const [validated, setValidated] = useState(false);
    const [{ message: forgotPasswordAlertMsg, variant: forgotPasswordAlertType }, setForgotPasswordAlertMsg] = useAlertState();
    const [formState, setFormState] = useState<ForgotPasswordFormData>({ email: defaultEmail });
    const history = useHistory();

    const handleForgotPassword = () => {
        setForgotPasswordAlertMsg({
            message: 'Forgot password email sent successfully!',
            variant: 'success'
        });
        setTimeout(() => {
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
        <Form noValidate validated={validated} onSubmit={handleSubmit} action='#'>
            <Form.Group controlId="institutionalEmail">
                {(forgotPasswordAlertMsg !== '') && <Alert variant={forgotPasswordAlertType}>{forgotPasswordAlertMsg}</Alert>}
                <Form.Label>Institutional Email Address</Form.Label>
                <Form.Control
                    required
                    defaultValue={formState.email}
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
    );
};
