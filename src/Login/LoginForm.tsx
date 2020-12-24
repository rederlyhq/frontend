import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import useAlertState from '../Hooks/useAlertState';
import { useHistory } from 'react-router-dom';
import Cookie from 'js-cookie';
import { getUserRoleFromServer } from '../Enums/UserRole';
import { ForgotPasswordButtonAndModal } from './ForgotPasswordButtonAndModal';
import { postLogin } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import BackendAPIError, { isAxiosError } from '../APIInterfaces/BackendAPI/BackendAPIError';
import ResendVerificationModal from './ResendVerificationModal';
import logger from '../Utilities/Logger';
import _ from 'lodash';
import { gaTrackLogin } from '../Hooks/useTracking';
import localPreferences from '../Utilities/LocalPreferences';
import AxiosRequest from '../Hooks/AxiosRequest';
const { general, session, account } = localPreferences;

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
    const [{ message: loginAlertMsg, variant: registrationAlertType }, setLoginAlertMsg] = useAlertState();
    const [formState, setFormState] = useState<LoginFormData>({ email: '', password: '' });
    const [showResendVerificationModal, setShowResendVerificationModal] = useState<boolean>(false);

    const history = useHistory();

    const handleNamedChange = (name: keyof LoginFormData) => {
        return (event: any) => {
            if (name !== event.target.name) {
                logger.error(`Mismatched event, ${name} is on ${event.target.name}`);
            }
            const val = event.target.value;
            setFormState({ ...formState, [name]: val });
        };
    };

    const handleLogin = async () => {
        try {
            const resp = await postLogin({
                email: formState.email,
                password: formState.password
            });

            if (resp.status === 200) {
                setLoginAlertMsg({ message: resp.data?.msg || 'Logged in!', variant: 'success' });
                session.userId = resp.data.data.userId;
                session.userType = getUserRoleFromServer(resp.data.data.roleId);
                session.userUUID = resp.data.data.uuid;
                session.username = `${resp.data.data.firstName} ${resp.data.data.lastName}`;
                gaTrackLogin('EMAIL', session.userId);
                history.replace('/common/courses');
            }
        } catch (err) {
            let handled = false;
            if (err instanceof BackendAPIError && isAxiosError(err.originalError)) {
                if (err.originalError.response?.status === 401) {
                    setLoginAlertMsg({ message: 'Login Failed. Incorrect email and/or password.', variant: 'danger' });
                    handled = true;
                } else if(err.originalError.response?.status === 403) {
                    setShowResendVerificationModal(true);
                    handled = true;
                }
            }
            if (!handled) {
                setLoginAlertMsg({ message: err.message, variant: 'danger' });
            }
        }

        try {
            const res = await AxiosRequest.get('/users/status');
            const data = res.data.data as { userPaidUntil: Date, universityPaidUntil: Date };
            const userPaidMoment = data.userPaidUntil.toMoment();
            const universityPaidMoment = data.universityPaidUntil.toMoment();

            let paidUntil: moment.Moment | undefined;
            let accountType: string | undefined;
            if (userPaidMoment.isAfter(universityPaidMoment)) {
                paidUntil = userPaidMoment;
                accountType = 'INDIVIDUAL';
            } else {
                paidUntil = universityPaidMoment;
                accountType = 'INSTITUTIONAL';
            }

            account.paidUntil = paidUntil.toDate();
            account.accountOwner = accountType;
        } catch (e) {
            logger.error('Could not get user status', e);
        }

    };

    const handleSubmit = (event: any) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            handleLogin();
        }

        setValidated(true);
    };

    useEffect(() => {
        const token = Cookie.get('sessionToken');
        if (token) {
            logger.info('Already logged in, pushing to Courses.');
            // TODO: Check user type
            const { loginRedirectURL } = general;
            if (_.isNil(loginRedirectURL)) {
                history.push('/common/courses');
            } else {
                general.loginRedirectURL = null;
                history.push(loginRedirectURL);
            }
        }
    });

    return (
        <>
            <ResendVerificationModal
                email={formState.email}
                showResendVerificationModal={showResendVerificationModal}
                setShowResendVerificationModal={setShowResendVerificationModal}
            />
            <Form noValidate validated={validated} onSubmit={handleSubmit} action='#'>
                <Form.Group controlId="institutionalEmail">
                    {(loginAlertMsg !== '') && <Alert variant={registrationAlertType}>{loginAlertMsg}</Alert>}
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
            <Row>
                <Col className="text-center">
                    <ForgotPasswordButtonAndModal defaultEmail={formState.email} />
                </Col>
            </Row>
        </>
    );
};

export default LoginForm;