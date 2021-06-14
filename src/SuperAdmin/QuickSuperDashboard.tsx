import React from 'react';
import ForceVerifyUserForm from './ForceVerifyUserForm';
import ForcePaidUntilForm from './ForcePaidUntilForm';
import AddUniversityForm from './AddUniversityForm';
import CheckUserInfoForm from './CheckUserInfo';

export const QuickSuperDashboard: React.FC<any> = () => {
    return <>
        <CheckUserInfoForm />
        <ForceVerifyUserForm />
        <ForcePaidUntilForm />
        <AddUniversityForm />
    </>;
};

export default QuickSuperDashboard;
