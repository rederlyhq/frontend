import React from 'react';
import { ListGroupItem, ListGroup } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';

interface CourseListProps {
    courses: Array<String>;
}

export const CourseList: React.FC<CourseListProps> = ({courses}) => {
    const { url } = useRouteMatch();

    return (
        <ListGroup>
            {courses.map((name, i) => <ListGroupItem action href={`${url}/${name}`} key={i}>{name}</ListGroupItem>)}
        </ListGroup>
    );
};
export default CourseList;