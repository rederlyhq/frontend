import { Button, Grid, TextField, Container } from '@material-ui/core';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import BackendAPIError from '../APIInterfaces/BackendAPI/BackendAPIError';
import { getVerification } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import logger from '../Utilities/Logger';
import { Alert as MUIAlert } from '@material-ui/lab';
import { useMUIAlertState } from '../Hooks/useAlertState';
import LandingPageWrapper from '../Components/LandingPageWrapper';

interface VerificationLandingPageProps {

}

interface ConfirmVerifyFormInputs {
    confirmEmail: string;
}

// TODO: Use Axios.Request JSX to selectively render success or failure.
export const VerificationLandingPage: React.FC<VerificationLandingPageProps> = () => {
    const { uid } = useParams<{
        uid: string;
    }>();
    
    const history = useHistory();
    const { register, handleSubmit } = useForm<ConfirmVerifyFormInputs>();
    const [{ message, severity }, setUpdateAlert] = useMUIAlertState();

    const onSubmit = async (data: ConfirmVerifyFormInputs) => {
        try {
            const res = await getVerification({
                verifyToken: uid,
                confirmEmail: data.confirmEmail,
            });
            if (res.status !== 200) {
                logger.warn(`Verification succeeded but got a non 200 status code: ${res.status}`);
            }
            setUpdateAlert({message: 'Success! Your account has been verified. You will be redirected to the login page momentarily.', severity: 'success'});
            setTimeout(()=>{
                history.replace('/common/courses');
            }, 2000);
        } catch (e) {
            if (e instanceof BackendAPIError && e.status === 400) {
                setUpdateAlert({message: e.message, severity: 'error'});
            } else {
                logger.error('VerificationLandingPage: expected error to be a bad request but got some other error', e);
                setUpdateAlert({message: e.message, severity: 'error'});
            }
        }
    };
    
    if (!uid) return <div>This page is no longer valid.</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{height: '100%'}}>
            <LandingPageWrapper>
                {message !== '' && 
                        <MUIAlert severity={severity}>
                            {message}
                        </MUIAlert>
                }
                <Grid
                    container 
                    item 
                    style={{flexDirection: 'column', height: '40vh'}} 
                    justify='space-evenly'
                >
                    <div>
                        <h1>Verify Your Account</h1>
                        <h3>Please enter your email address below and click Verify to confirm your email address.</h3>
                    </div>
                    <TextField 
                        id='confirmEmail' 
                        name='confirmEmail' 
                        label='Confirm Email' 
                        variant='outlined' 
                        inputRef={register({required: true})}
                        type='email'
                        fullWidth={true}
                    />
                    <Button 
                        variant='contained' 
                        size='large' 
                        type='submit'
                        color='primary'
                        style={{alignSelf: 'flex-end'}}
                    >
                                Verify
                    </Button>
                </Grid>
            </LandingPageWrapper>
        </form>
    );
};

export default VerificationLandingPage;