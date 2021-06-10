import React from 'react';
import { useForm } from 'react-hook-form';
import { superAdminUpdate } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import logger from '../Utilities/Logger';
import { useGlobalSnackbarContext } from '../Contexts/GlobalSnackbar';

export const ForceVerifyUserForm: React.FC<any> = ({}) => {
    const { register, handleSubmit } = useForm<{forceVerifyEmail: string}>();
    const setAlert = useGlobalSnackbarContext();

    const submit = async (data: {forceVerifyEmail: string}) => {
        try {
            await superAdminUpdate({email: data.forceVerifyEmail});
            setAlert?.({severity: 'success', message: `Updated ${data.forceVerifyEmail}`});
        } catch(e) {
            logger.error(e);
            setAlert?.({severity: 'error', message: 'Failed to force verify. Check logs.'});
        }
    };

    return <form onSubmit={handleSubmit(submit)} >
        <h1>Force Verify</h1>
        Email:
        <input name='forceVerifyEmail' type='email' ref={register({
            required: true,
        })} />
        <button type='submit'>Force Verify</button>
    </form>;
};

export default ForceVerifyUserForm;
