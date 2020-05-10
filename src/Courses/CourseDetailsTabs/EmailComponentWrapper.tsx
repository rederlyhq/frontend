import React, { useState, useContext } from 'react';
import CourseUsersList from './CourseUsersList';
import { UserObject } from '../CourseInterfaces';
import { Row, Col, Button } from 'react-bootstrap';
import { userContext } from '../../NavWrapper/NavWrapper';
import EmailModal from './EmailModal';

interface EmailComponentWrapperProps {
    users: Array<UserObject>;
}

/**
 * This component manages the state for the Email Students functionality.
 */
export const EmailComponentWrapper: React.FC<EmailComponentWrapperProps> = ({users}) => {
    const [selectedStudents, setSelectedStudents] = useState<Array<Set<number>>>([new Set()]);
    const [showModal, setShowModal] = useState(false);
    const { userType } = useContext(userContext);

    return (
        <>
            <Row>
                <Col md={10}>
                    <h2>Current Enrollments</h2>
                </Col>
                <Col md={2}>
                    {userType === 'Professor' && <Button className="email float-right" onClick={() => setShowModal(true)}>Email Students</Button>}
                    <EmailModal show={showModal} setClose={() => setShowModal(false)} users={selectedStudents[0]} />
                </Col>
            </Row>
            <CourseUsersList users={users} setActive={setSelectedStudents} activeUsers={selectedStudents} />
        </>
    );
};

export default EmailComponentWrapper;