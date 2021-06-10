import React from 'react';
import ForceVerifyUserForm from './ForceVerifyUserForm';
import ForcePaidUntilForm from './ForcePaidUntilForm';
import AddUniversityForm from './AddUniversityForm';

export const QuickSuperDashboard: React.FC<any> = () => {
    return <>
        <ForceVerifyUserForm />
        <ForcePaidUntilForm />
        <AddUniversityForm />
    </>;
};

export default QuickSuperDashboard;
