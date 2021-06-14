import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { superAdminGetUser } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import logger from '../Utilities/Logger';
import { useGlobalSnackbarContext } from '../Contexts/GlobalSnackbar';
import { UserObject } from '../Courses/CourseInterfaces';
import _ from 'lodash';
import moment from 'moment';

export const CheckUserInfoForm: React.FC<any> = () => {
    const { register, handleSubmit } = useForm<{forceVerifyEmail: string}>();
    const [user, setUser] = useState<Partial<UserObject> | null | undefined>(undefined);
    const setAlert = useGlobalSnackbarContext();

    const submit = async (data: {checkUserEmail: string}) => {
        try {
            const res = await superAdminGetUser({email: data.checkUserEmail});
            setUser(res.data.data);
            setAlert?.({severity: 'success', message: `Got ${data.checkUserEmail}`});
        } catch(e) {
            logger.error('Failed to check user.', e);
            setUser(null);
            setAlert?.({severity: 'error', message: e.message});
        }
    };

    return <form onSubmit={handleSubmit(submit)} >
        <h1>Check User</h1>
        Email:
        <input name='checkUserEmail' type='email' ref={register({
            required: true,
        })} />
        {user !== undefined && (
            user === null ? 
                <>No user found</> : 
                <table>
                    {_.keys(user).map((key) => <tr key={key}>
                        <td style={{border: '1px solid black'}}>
                            {key}
                        </td>
                        <td style={{border: '1px solid black'}}>
                            {key === 'paidUntil' || key === 'updatedAt' ? 
                                `${moment(_.get(user, key))} (${moment(_.get(user, key)).calendar()})` :
                                _.get(user, key).toString()}
                        </td>
                    </tr>)}
                </table>
        )}
        <button type='submit'>Check</button>
    </form>;
};

export default CheckUserInfoForm;
