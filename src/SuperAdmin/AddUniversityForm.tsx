import React from 'react';
import { useForm } from 'react-hook-form';
import logger from '../Utilities/Logger';
import { useGlobalSnackbarContext } from '../Contexts/GlobalSnackbar';
import { UniversityCreationType } from '../APIInterfaces/BackendAPI/RequestTypes/UniversityRequestTypes';
import { createUniversity } from '../APIInterfaces/BackendAPI/Requests/UniversityRequests';

export const AddUniversityForm: React.FC<any> = () => {
    const { register, handleSubmit } = useForm<UniversityCreationType>();
    const setAlert = useGlobalSnackbarContext();

    const submit = async (data: UniversityCreationType) => {
        try {
            await createUniversity({
                name: data.name,
                professorDomain: data.professorDomain,
                studentDomain: data.studentDomain,
                autoVerify: data.autoVerify,
                paidUntil: data.paidUntil,
            });
            setAlert?.({severity: 'success', message: 'Created university'});
        } catch(e) {
            logger.error('AddUniversityForm', e);
            setAlert?.({severity: 'error', message: 'Failed to create university. Check logs.'});
        }
    };

    return <form onSubmit={handleSubmit(submit)} >
        <h1>Add University</h1>
        <label htmlFor='name'>University Name:</label>
        <input name='name' type='text' ref={register({
            required: true,
        })} /><br/>
        <label htmlFor='professorDomain'>Professor Domain:</label>
        <input name='professorDomain' type='text' ref={register({
            required: true,
        })} /><br/>
        <label htmlFor='studentDomain'>Student Domain:</label>
        <input name='studentDomain' type='text' ref={register({
            required: true,
        })} /><br/>
        <label htmlFor='autoVerify'>autoVerify:</label>
        <input name='autoVerify' type='checkbox' ref={register({})} /><br/>
        <label htmlFor='paidUntil'>Paid Until:</label>
        <input name='paidUntil' type='date' ref={register({
            required: true,
        })} /><br/>
        <button type='submit'>Add University</button>
    </form>;
};

export default AddUniversityForm;
