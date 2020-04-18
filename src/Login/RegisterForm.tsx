import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import AxiosRequest from '../Hooks/AxiosRequest';
import SimpleFormRow from '../Components/SimpleFormRow';

interface RegisterFormProps {

}

type RegisterFormData = {
    email: string;
    password: string;
}

/**
 * This component renders the Render form.
 */
export const RegisterForm: React.FC<RegisterFormProps> = () => {
    const [validated, setValidated] = useState(false);
    const [loginError, setLoginError] = useState('');

    const handleRegister = async () => {
        try {
            const resp = await AxiosRequest.post('/users/register', {});
            console.log(resp.data);

            // setLoginError(resp.data.msg);
        } catch (err) {
            setLoginError('A network error occurred. Please try again later.');
        }
    };

    const handleSubmit = (event: any) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            handleRegister();
        }
  
        setValidated(true);
    };

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit} action='#'>
            {(loginError !== '') && <Alert variant="danger">{loginError}</Alert>}
            <SimpleFormRow
                required
                id='given-name'
                label='First Name'
                defaultValue='' 
                name="given-name" 
                autoComplete="given-name"
                placeholder="Charles"
            />
            <SimpleFormRow
                required
                id='family-name'
                label='Last Name'
                defaultValue='' 
                name="family-name" 
                autoComplete="family-name"
                placeholder="Xavier"
            />
            <Form.Group controlId="institutionalEmail">
                <Form.Label>Institutional Email Address</Form.Label>
                <Form.Control
                    required
                    defaultValue='' 
                    name="email" 
                    autoComplete="email" 
                    type="email" 
                    placeholder="cxavier@xavierinstitute.edu"
                />
                <Form.Control.Feedback type="invalid">{<span>An Institutional is required.</span>}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    required
                    defaultValue='' 
                    name="password" 
                    autoComplete="current-password" 
                    type="password" 
                    placeholder="******"
                    // TODO: Minimum password requirements
                    minLength={4}
                    maxLength={26}
                />
                <Form.Control.Feedback type="invalid">{<span>A password is required.</span>}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Button type="submit">Submit</Button>
            </Form.Group>
        </Form>
    );
};

export default RegisterForm;