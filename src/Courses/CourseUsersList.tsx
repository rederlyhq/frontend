import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { UserObject } from './CourseInterfaces';

interface CourseUsersListProps {
    users: Array<UserObject>;
}

export const CourseUsersList: React.FC<CourseUsersListProps> = ({users}) => {
    return (
        <ListGroup>
            {users.map((user, i) => (
                <ListGroupItem key={i}>
                    {user.last_name}, {user.first_name}
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};
export default CourseUsersList;