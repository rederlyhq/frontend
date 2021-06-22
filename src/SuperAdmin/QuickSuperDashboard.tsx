import React from 'react';
import ForceVerifyUserForm from './ForceVerifyUserForm';
import ForcePaidUntilForm from './ForcePaidUntilForm';
import AddUniversityForm from './AddUniversityForm';
import CheckUserInfoForm from './CheckUserInfo';
import PromoteToProfForm from './PromoteToProfForm';

export const QuickSuperDashboard: React.FC<any> = () => {
    return <>
        <CheckUserInfoForm />
        <ForceVerifyUserForm />
        <PromoteToProfForm />
        <ForcePaidUntilForm />
        <AddUniversityForm />
    </>;
};

export default QuickSuperDashboard;
