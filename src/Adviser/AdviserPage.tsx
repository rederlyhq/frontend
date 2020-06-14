import React from 'react';
import EmailComponentWrapper from '../Courses/CourseDetailsTabs/EmailComponentWrapper';
import { UserObject } from '../Courses/CourseInterfaces';

interface AdviserPageProps {

}

const mock_users = [
    new UserObject({first_name: 'Jean', last_name: 'Grey', id: 1}),
    new UserObject({first_name: 'Gibryon', last_name: 'Bhojraj', id: 2}),
    new UserObject({first_name: 'Scott', last_name: 'Summers', id: 3}),
];

export const AdviserPage: React.FC<AdviserPageProps> = ({}) => {
    return (
        <div className='text-center'>
            <h1>Adviser View</h1>
            <EmailComponentWrapper users={mock_users}/>
        </div>
    );
};

export default AdviserPage;