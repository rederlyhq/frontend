import React, { useState } from 'react';
import { ListGroup, ListGroupItem, Row, Col, Form, FormControl, Button } from 'react-bootstrap';
import { UserObject } from '../CourseInterfaces';
import _ from 'lodash';

interface CourseUsersListProps {
    users: Array<UserObject>;
    activeUsers: Array<Set<number>>;
    setActive: React.Dispatch<React.SetStateAction<Set<number>[]>>;
}

export const CourseUsersList: React.FC<CourseUsersListProps> = ({users, activeUsers, setActive}) => {
    // TODO: This should be refactored into a reusable TwoState button.
    const [selectAllState, setSelectAllState] = useState(false);

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

    return (
        <Form>
            <Form.Group controlId="searchBar">
                <Row>
                    <Col md={10}>                    
                        <FormControl type="text" />
                    </Col>
                    <Col md={2}>
                        <Button onClick={() => onSelectAll()}>{selectAllState ? 'Unselect All' : 'Select All'}</Button>
                    </Col>
                </Row>
            </Form.Group>
            <ListGroup>
                {users.map((user, i) => (
                    <ListGroupItem key={i} active={activeUsers[0].has(user.id)} onClick={() => onClickStudent(user.id)}>
                        {user.last_name}, {user.first_name}
                    </ListGroupItem>
                ))}
            </ListGroup>
        </Form>
    );
};
export default CourseUsersList;