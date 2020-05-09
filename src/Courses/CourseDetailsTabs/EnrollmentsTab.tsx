import React, { useContext } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { userContext } from '../../NavWrapper/NavWrapper';
import CourseUsersList from '../CourseUsersList';
import { UserObject } from '../CourseInterfaces';

interface EnrollmentsTabProps {

}

const mock_users = [
    new UserObject({first_name: 'Scott', last_name: 'Summers'}),
    new UserObject({first_name: 'Henry', last_name: 'McCoy'}),
    new UserObject({first_name: 'Jean', last_name: 'Grey'}),
    new UserObject({first_name: 'Anne', last_name: 'LeBeau'}),
];

export const EnrollmentsTab: React.FC<EnrollmentsTabProps> = () => {
    const { userType } = useContext(userContext);
    return (
        <>
            <Row>
                <Col md={10}>
                    <h2>Current Enrollments</h2>
                </Col>
                <Col md={2}>
                    {userType === 'Professor' && <Button className="email float-right">Email Students</Button>}
                </Col>
            </Row>
            <CourseUsersList users={mock_users} />
        </>
    );
};

export default EnrollmentsTab;