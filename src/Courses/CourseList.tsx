import React from 'react';
import { ListGroupItem, ListGroup } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';
import CourseRowComponent from './CourseRowComponent';
import { CourseObject } from './CourseInterfaces';

interface CourseListProps {
    courses: Array<CourseObject>;
}

export const CourseList: React.FC<CourseListProps> = ({courses}) => {
    const { url } = useRouteMatch();

    return (
        <ListGroup>
            {courses.map(obj => <ListGroupItem action href={`${url}/${obj.id}`} key={`course${obj.id}`}>
                <CourseRowComponent 
                    {...obj}
                />
            </ListGroupItem>)}
        </ListGroup>
    );
};
export default CourseList;