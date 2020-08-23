import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import AxiosRequest from '../Hooks/AxiosRequest';
import SimpleFormRow from '../Components/SimpleFormRow';
import useAlertState from '../Hooks/useAlertState';

interface RegisterFormProps {

}

type RegisterFormData = {
    registerEmail: string;
    registerFirstName: string;
    registerLastName: string;
    registerPassword: string;
    registerPasswordConf: string;
}

/**
 * This component renders the Render form.
 */
export const RegisterForm: React.FC<RegisterFormProps> = () => {
    const [validated, setValidated] = useState(false);
    const [{message: registrationAlertMsg, variant: registrationAlertType}, setRegistrationAlert] = useAlertState();
    const [formState, setFormState] = useState<RegisterFormData>({
        registerEmail: '', 
        registerPassword: '', 
        registerFirstName: '', 
        registerLastName: '',
        registerPasswordConf: '',
    });
    const [doPasswordsMatch, setDoPasswordsMatch] = useState<Boolean>(false);

    useEffect(() => {
        setDoPasswordsMatch(formState.registerPassword === formState.registerPasswordConf);
    }, [formState.registerPassword, formState.registerPasswordConf]);
    
    const handleNamedChange = (name: keyof RegisterFormData) => {
        return (event: any) => {
            if (name !== event.target.name) { 
                console.error(`Mismatched event, ${name} is on ${event.target.name}`);
            }
            const val = event.target.value;
            setFormState({...formState, [name]: val});
        };
    };

    const handleRegister = async () => {
        try {
            const resp = await AxiosRequest.post('/users/register', 
                {
                    email: formState.registerEmail,
                    password: formState.registerPassword,
                    firstName: formState.registerFirstName,
                    lastName: formState.registerLastName,
                });
            console.log(resp);

            if (resp.status === 201) {
                let message = 'Registration succeeded!';
                if (!resp.data.data.verificationBypass) {
                    message =`${message} Please check your email to continue.`;
                }
                setRegistrationAlert({message, variant: 'success'});
            } else {
                setRegistrationAlert({message: 'Registration failed.', variant: 'danger'});
            }

            // setLoginError(resp.data.msg);
            
            // TODO: Needs some indication that the operation was successful. Is an alert sufficient, or 
            //       should we redirect to a new page? Or should we get a session token back and proceed as logged in?
        } catch (err) {
            setRegistrationAlert({message: 'A network error occurred. Please try again later.', variant: 'danger'});
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
            {(registrationAlertMsg !== '') && <Alert variant={registrationAlertType}>{registrationAlertMsg}</Alert>}
            <SimpleFormRow
                required
                id='registerFirstName'
                label='First Name'
                defaultValue='' 
                name="registerFirstName" 
                autoComplete="given-name"
                placeholder="Charles"
                errmsg="Your last name is required."
                onChange={handleNamedChange('registerFirstName')}
            />
            <SimpleFormRow
                id='registerLastName'
                label='Last Name'
                errmsg="Your last name is required."
                required
                defaultValue='' 
                name="registerLastName" 
                autoComplete="family-name"
                placeholder="Xavier"
                onChange={handleNamedChange('registerLastName')}
            />
            <SimpleFormRow
                id="registerEmail"
                label="Institutional Email Address"
                errmsg="An Institutional email address is required."
                required
                defaultValue='' 
                name="registerEmail" 
                autoComplete="email" 
                type="email" 
                placeholder="cxavier@xavierinstitute.edu"
                onChange={handleNamedChange('registerEmail')}
            />
            <SimpleFormRow 
                id="password"
                label="Password"
                errmsg="Your password must be at least 4 characters long."
                required
                defaultValue=''
                name="registerPassword" 
                autoComplete="new-password" 
                type="password" 
                onChange={handleNamedChange('registerPassword')}
                placeholder="******"
                // TODO: Minimum password requirements
                minLength={4}
                maxLength={26}
            />
            <SimpleFormRow
                id="registerPasswordConf"
                label="Confirm Password"
                errmsg="Passwords must match."
                type="password"
                autocomplete="new-password"
                isValid={formState.registerPassword?.length > 3 && doPasswordsMatch}
                onChange={handleNamedChange('registerPasswordConf')}
            />
            <Form.Group>
                <Button type="submit" disabled={registrationAlertType === 'success'}>Submit</Button>
            </Form.Group>
        </Form>
    );
};

export default RegisterForm;