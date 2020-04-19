import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import AxiosRequest from '../Hooks/AxiosRequest';

interface LoginFormProps {

}

type LoginFormData = {
    email: string;
    password: string;
}

/**
 * This component renders the Login form, and should redirect the user if login succeeds.
 * 
 * Suggestion: Could useEffect to prevalidate institutional emails?
 */
export const LoginForm: React.FC<LoginFormProps> = () => {
    const [validated, setValidated] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [formState, setFormState] = useState<LoginFormData>({email: '', password: ''});

    const handleNamedChange = (name: keyof LoginFormData) => {
        return (event: any) => {
            if (name !== event.target.name) { 
                console.error(`Mismatched event, ${name} is on ${event.target.name}`);
            }
            const val = event.target.value;
            setFormState({...formState, [name]: val});
        };
    };

    const handleLogin = async () => {
        try {
            const resp = await AxiosRequest.post('/users/login', {email: formState.email, password: formState.password});
            console.log(resp.data);

            setLoginError(resp.data.msg);
            // TODO: Redirect to Course List page.
        } catch (err) {
            console.log(err);
            setLoginError(err.message);
            // setLoginError('A network error occurred. Please try again later.');
        }
    };

    const handleSubmit = (event: any) => {
        console.log(event);
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            console.log(form);
            handleLogin();
        }
  
        setValidated(true);
    };

    return (
        <Form noValidate validated={validated} onSubmit={handleSubmit} action='#'>
            <Form.Group controlId="institutionalEmail">
                {(loginError !== '') && <Alert variant="danger">{loginError}</Alert>}
                <Form.Label>Institutional Email Address</Form.Label>
                <Form.Control
                    required
                    defaultValue='' 
                    name="email" 
                    autoComplete="username" 
                    type="email" 
                    placeholder="cxavier@xavierinstitute.edu"
                    onChange={handleNamedChange('email')}
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
                    onChange={handleNamedChange('password')}
                />
                <Form.Control.Feedback type="invalid">{<span>A password is required.</span>}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                <Button type="submit">Submit</Button>
            </Form.Group>
        </Form>
    );
};

export default LoginForm;