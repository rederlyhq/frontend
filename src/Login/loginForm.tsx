import React from 'react';
import { Form } from 'react-bootstrap';

interface loginFormProps {

}

export const loginForm: React.FC<loginFormProps> = () => (
    <Form>
        <Form.Group controlId="institutionalEmail">
            <Form.Label>Institutional Email Address</Form.Label>
            <Form.Control type="email" placeholder="cxavier@xavierinstitute.edu"></Form.Control>
        </Form.Group>
        <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="******"></Form.Control>
        </Form.Group>
    </Form>
);

export default loginForm;