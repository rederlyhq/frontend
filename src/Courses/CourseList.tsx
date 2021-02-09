import React from 'react';
import { ListGroupItem, ListGroup } from 'react-bootstrap';
import { useRouteMatch, Link } from 'react-router-dom';
import CourseRowComponent from './CourseRowComponent';
import { CourseObject } from './CourseInterfaces';
import _ from 'lodash';
import { getUserRole, UserRole } from '../Enums/UserRole';
import logger from '../Utilities/Logger';

interface CourseListProps {
    courses: Array<CourseObject>;
}

export const CourseList: React.FC<CourseListProps> = ({courses}) => {
    const { url } = useRouteMatch();

    if(_.isEmpty(courses)) {
        const userRole = getUserRole();
        if (userRole === UserRole.STUDENT) {
            return <p>You are not enrolled in any courses yet on this platform. Please get an enrollment link from your professor to join your class.</p>;
        } else if (userRole === UserRole.PROFESSOR) {
            return <p>You have not created any classes yet. Please click <strong>Create Course</strong> to begin</p>;
        } else {
            logger.error(`CourseList: Unhandled role in course list ${userRole}`);
            return <p>This course list is empty.</p>;
        }
    }
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