import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';

interface LoginFormProps {

}

type LoginFormData = {
    email: string;
    password: string;
}

export const LoginForm: React.FC<LoginFormProps> = () => {
    const { handleSubmit, watch, control, errors } = useForm();

    const onSubmit = (data: any) => (console.log(data));

    console.log(errors);

    return (
        <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="institutionalEmail">
                <Form.Label>Institutional Email Address</Form.Label>
                {/* <Form.Control name="email" autoComplete="username" type="email" placeholder="cxavier@xavierinstitute.edu" ref={register} /> */}
                <Controller 
                    as={Form.Control} 
                    defaultValue='' 
                    name="email" 
                    autoComplete="username" 
                    type="email" 
                    placeholder="cxavier@xavierinstitute.edu"
                    control={control}
                    rules={{required: true, pattern: RegExp('^.*@.*$')}}
                    isValid={false}
                    // isValid={!errors.email}
                />
                <Form.Control.Feedback type="invalid">{errors.email && <span>An Institutional is required.</span>}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                {/* <Form.Control name="password" autoComplete="current-password" type="password" placeholder="******" ref={register} /> */}
                <Controller 
                    as={Form.Control} 
                    defaultValue='' 
                    name="password" 
                    autoComplete="current-password" 
                    type="password" 
                    placeholder="******" 
                    control={control}
                    rules={{required: true, minLength: 8, maxLength: 26}}
                    isValid={!errors.password}
                />
                <Form.Control.Feedback type="invalid">{errors.password && <span>A password is required.</span>}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
                {/* <Form.Control type="submit" /> */}
                <Button type="submit">Submit</Button>
            </Form.Group>
        </Form>
    );
};

export default LoginForm;