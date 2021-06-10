import React from 'react';
import { useForm } from 'react-hook-form';
import { superAdminUpdate } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import logger from '../Utilities/Logger';
import { useGlobalSnackbarContext } from '../Contexts/GlobalSnackbar';

export const ForcePaidUntilForm: React.FC<any> = ({}) => {
    const { register, handleSubmit } = useForm<{forcePaidUntilEmail: string, paidUntilDate: Date}>();
    const setAlert = useGlobalSnackbarContext();

    const submit = async (data: {forcePaidUntilEmail: string, paidUntilDate: Date}) => {
        try {
            await superAdminUpdate({email: data.forcePaidUntilEmail, paidUntil: data.paidUntilDate});
            setAlert?.({severity: 'success', message: `Updated ${data.forcePaidUntilEmail}`});
        } catch(e) {
            logger.error(e);
            setAlert?.({severity: 'error', message: 'Failed to force verify. Check logs.'});
        }
    };

    return <form onSubmit={handleSubmit(submit)} >
        <h1>Force Paid Until</h1>
        Email:
        <input name='forcePaidUntilEmail' type='email' ref={register({
            required: true,
        })} />
        <input name='paidUntilDate' type='date' ref={register({
            required: true,
        })} />
        <button type='submit'>Set Paid Until</button>
    </form>;
};

export default ForcePaidUntilForm;
