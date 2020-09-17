import React, { useState, useEffect, useContext } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, FormControl, Button } from 'react-bootstrap';
import { UserObject } from '../CourseInterfaces';
import _ from 'lodash';
import { deleteEnrollment } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { courseContext } from '../CourseDetailsPage';

interface CourseUsersListProps {
    users: Array<UserObject>;
    activeUsers: Array<Set<number>>;
    setActive: React.Dispatch<React.SetStateAction<Set<number>[]>>;
}

export const CourseUsersList: React.FC<CourseUsersListProps> = ({users, activeUsers, setActive}) => {
    // TODO: This should be refactored into a reusable TwoState button.
    const [selectAllState, setSelectAllState] = useState(false);
    const [searchedUsers, setSearchedUsers] = useState<Array<UserObject>>(users);
    const course = useContext(courseContext);

    useEffect(()=>{
        setSearchedUsers(users);
    }, [users]);

    // Add or remove a user's ID to the active users array.
    const onClickStudent = (id: number) => {
        if (activeUsers[0].has(id)) {
            activeUsers[0].delete(id);
            setActive([activeUsers[0]]);
        } else {
            setActive([activeUsers[0].add(id)]);
        }
    };

    const onSelectAll = () => {
        // If all are currently selected, select none.
        if (selectAllState) {
            setActive([new Set()]);
        } else {
            const allUserIds: Array<number> = users.map(user => user.id);
            setActive([new Set(allUserIds)]);
        }

        setSelectAllState(!selectAllState);
    };

    const filterUser = (e: any) => {
        if (!e.target || e.target.value === '') {
            setSearchedUsers(users);
            return;
        }

        const filteredUsers = _.filter(users, (user: UserObject) => {
            if (!user.firstName || !user.lastName) {
                console.error(`User is missing a name: ${user.firstName} ${user.lastName}`);
                return false;
            }
            return user.firstName.indexOf(e.target.value) > -1 || user.lastName.indexOf(e.target.value) > -1;
        });
        setSearchedUsers(filteredUsers);
    };

    return (
        <Form>
            <Form.Group controlId="searchBar">
                <Row>
                    <Col md={10}>                    
                        <FormControl title='Search enrolled students' type="search" onChange={filterUser} />
                    </Col>
                    <Col md={2}>
                        <Button onClick={() => onSelectAll()}>{selectAllState ? 'Unselect All' : 'Select All'}</Button>
                    </Col>
                </Row>
            </Form.Group>
            <ListGroup>
                {searchedUsers.map(user => (
                    <ListGroupItem
                        key={`user${user.id}`} 
                        active={activeUsers[0].has(user.id)} 
                        onClick={() => onClickStudent(user.id)}
                        style={{cursor: 'pointer'}}
                    >
                        {user.lastName}, {user.firstName}
                        <Button variant='danger' onClick={async () => deleteEnrollment({userId: user.id, courseId: course.id})}>Delete</Button>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </Form>
    );
};
export default CourseUsersList;