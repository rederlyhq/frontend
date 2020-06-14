import React, { useEffect, useState } from 'react';
import { UserObject } from '../CourseInterfaces';
import EmailComponentWrapper from './EmailComponentWrapper';
import AxiosRequest from '../../Hooks/AxiosRequest';

interface EnrollmentsTabProps {
    courseId: number
}

export const EnrollmentsTab: React.FC<EnrollmentsTabProps> = ({courseId}) => {
    const [users, setUsers] = useState<Array<UserObject>>([]);

    useEffect(() => {
        (async () => {
            const usersResp = await AxiosRequest.get(`/users?courseId=${courseId}`);
            console.log(usersResp.data);
            setUsers(usersResp.data.data);
        })();
    }, [courseId]);

    return (
        <EmailComponentWrapper users={users} />
    );
};

export default EnrollmentsTab;