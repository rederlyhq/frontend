import React from 'react';
import { useForm } from 'react-hook-form';
import { superAdminUpdate } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import logger from '../Utilities/Logger';
import { useGlobalSnackbarContext } from '../Contexts/GlobalSnackbar';

export const PromoteToProfForm: React.FC<any> = () => {
    const { register, handleSubmit } = useForm<{promoteToProfEmail: string}>();
    const setAlert = useGlobalSnackbarContext();

    const submit = async (data: {promoteToProfEmail: string}) => {
        try {
            await superAdminUpdate({email: data.promoteToProfEmail, roleId: 1});
            setAlert?.({severity: 'success', message: `Updated ${data.promoteToProfEmail}`});
        } catch(e) {
            logger.error('promoteToProfEmail', e);
            setAlert?.({severity: 'error', message: e.message});
        }
    };

    return <form onSubmit={handleSubmit(submit)} >
        <h1>Promote To Professor</h1>
        Email:
        <input name='promoteToProfEmail' type='email' ref={register({
            required: true,
        })} />
        <button type='submit'>Promote To Professor</button>
    </form>;
};

export default PromoteToProfForm;
