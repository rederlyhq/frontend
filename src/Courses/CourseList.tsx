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
            {courses.map((obj, i) => <ListGroupItem action href={`${url}/${obj.course_name}`} key={i}>
                <CourseRowComponent 
                    course_name={obj.course_name} 
                    course_start={obj.course_start}
                    course_end={obj.course_end}
                    course_code={obj.course_code}
                />
            </ListGroupItem>)}
        </ListGroup>
    );
};
export default CourseList;