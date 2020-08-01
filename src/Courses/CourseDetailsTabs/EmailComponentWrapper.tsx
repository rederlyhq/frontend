import React, { useState } from 'react';
import CourseUsersList from './CourseUsersList';
import { UserObject } from '../CourseInterfaces';
import { Button } from 'react-bootstrap';
import EmailModal from './EmailModal';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import Cookies from 'js-cookie';
import { CookieEnum } from '../../Enums/CookieEnum';

interface EmailComponentWrapperProps {
    users: Array<UserObject>;
}

/**
 * This component manages the state for the Email Students functionality.
 */
export const EmailComponentWrapper: React.FC<EmailComponentWrapperProps> = ({ users }) => {
    const [selectedStudents, setSelectedStudents] = useState<Array<Set<number>>>([new Set()]);
    const [showModal, setShowModal] = useState(false);
    const userType: UserRole = getUserRole(Cookies.get(CookieEnum.USERTYPE));

    return (
        <>
            {userType !== UserRole.STUDENT && <Button className="email float-right" onClick={() => setShowModal(true)}>Email Students</Button>}
            <EmailModal show={showModal} setClose={() => setShowModal(false)} users={selectedStudents[0]} />
            <CourseUsersList users={users} setActive={setSelectedStudents} activeUsers={selectedStudents} />
        </>
    );
};

export default EmailComponentWrapper;