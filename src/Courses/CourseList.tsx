import React from 'react';
import { ListGroupItem, ListGroup } from 'react-bootstrap';
import { useRouteMatch, Link } from 'react-router-dom';
import CourseRowComponent from './CourseRowComponent';
import { CourseObject } from './CourseInterfaces';

interface CourseListProps {
    courses: Array<CourseObject>;
}

export const CourseList: React.FC<CourseListProps> = ({courses}) => {
    const { url } = useRouteMatch();

    return (
        <ListGroup>
            {/* TODO: Make a link tag */}
            {courses.map(obj => ( 
                <Link to={`${url}/${obj.id}`} key={`course${obj.id}`}>
                    <ListGroupItem action href={`${url}/${obj.id}`}>
                        <CourseRowComponent 
                            {...obj}
                        />
                    </ListGroupItem>
                </Link>
            ))}
        </ListGroup>
    );
};
export default CourseList;