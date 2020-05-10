import React, { useContext } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { userContext } from '../../NavWrapper/NavWrapper';
import CourseUsersList from './CourseUsersList';
import { UserObject } from '../CourseInterfaces';
import EmailComponentWrapper from './EmailComponentWrapper';

interface EnrollmentsTabProps {

}

const mock_users = [
    new UserObject({first_name: 'Scott', last_name: 'Summers', id: 1}),
    new UserObject({first_name: 'Henry', last_name: 'McCoy', id: 2}),
    new UserObject({first_name: 'Jean', last_name: 'Grey', id: 3}),
    new UserObject({first_name: 'Anne', last_name: 'LeBeau', id: 4}),
];

export const EnrollmentsTab: React.FC<EnrollmentsTabProps> = () => {
    return (
        <EmailComponentWrapper users={mock_users} />
    );
};

export default EnrollmentsTab;