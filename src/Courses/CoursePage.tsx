import React, { useEffect, useState } from 'react';
import CourseList from './CourseList';
import AxiosRequest from '../Hooks/AxiosRequest';
import { map } from 'lodash';
import { CourseObject } from './CourseInterfaces';
import { Container, Row, Button, Col } from 'react-bootstrap';
import { BsPlusSquare } from 'react-icons/bs';
import { UserRole, getUserRole } from '../Enums/UserRole';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import logger from '../Utilities/Logger';
import localPreferences from '../Utilities/LocalPreferences';

interface CoursePageProps {

}

export const CoursePage: React.FC<CoursePageProps> = () => {
    const [courses, setCourses] = useState<Array<CourseObject>>([]);
    const userType: UserRole = getUserRole();
    const userId: string | null = localPreferences.session.userId;

    // Get the list of courses to render.
    useEffect(() => {
        if (_.isNil(userId) || userId === 'undefined') {
            logger.error('Missing userId cookie.');
            return;
        }

        (async () => {
            try {
                const idParams = getCourseIdParamFromRole(userType, parseInt(userId, 10));
                logger.debug(`Get course converted ${userId} to ${idParams}`);
                const res = await AxiosRequest.get(`/courses?${idParams}`);
                const courses: Array<CourseObject> = map(res.data?.data, obj => new CourseObject(obj));

                setCourses(courses);
            } catch (e) {
                logger.error('Could not get courses', e);
                setCourses([]);
            }
        })();
    }, [userType, userId]);

    const getCourseIdParamFromRole = (role: UserRole, id: number) => {
        switch(role) {
        case UserRole.STUDENT:
            return `enrolledUserId=${id}`;
        case UserRole.PROFESSOR:
        default:
            return `instructorId=${id}`;
        }
    };

    return (
        <div>
            <Container>
                <Row>
                    <Col md={10}>
                        <h1>My Courses</h1>
                    </Col>
                    <Col md={2}>
                        {userType === UserRole.PROFESSOR && (
                            <Link to={loc => `${loc.pathname}/new`}>
                                <Button className="float-right" style={{height: '100%'}}>
                                    <BsPlusSquare /> Create Course
                                </Button>
                            </Link>
                        )}
                    </Col>
                </Row>
                <CourseList courses={courses}/>
            </Container>
        </div>
    );
};
export default CoursePage;