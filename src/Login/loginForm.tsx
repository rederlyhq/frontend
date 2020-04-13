import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

interface LoginFormProps {

}

type LoginFormData = {
    email: string;
    password: string;
}

export const LoginForm: React.FC<LoginFormProps> = () => {
    const { register, handleSubmit, watch, errors } = useForm();

    const onSubmit = (data: any) => (console.log(data));

    console.log(watch('email'));

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="institutionalEmail">
                <Form.Label>Institutional Email Address</Form.Label>
                <Form.Control name="email" autoComplete="username" type="email" placeholder="cxavier@xavierinstitute.edu" ref={register} />
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control name="password" autoComplete="current-password" type="password" placeholder="******" ref={register} />
            </Form.Group>
            {errors.password && <span>A password is required.</span>}
            <Form.Group>
                <Button type="submit">Submit</Button>
            </Form.Group>
        </Form>
    );
}

export default LoginForm;