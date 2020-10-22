import React, { useEffect, useState } from 'react';
import CourseList from './CourseList';
import AxiosRequest from '../Hooks/AxiosRequest';
import { map } from 'lodash';
import { CourseObject } from './CourseInterfaces';
import { Container, Row, Button, Col } from 'react-bootstrap';
import { BsPlusSquare } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { UserRole, getUserRole } from '../Enums/UserRole';
import { Link } from 'react-router-dom';
import { CookieEnum } from '../Enums/CookieEnum';
import _ from 'lodash';
import logger from '../Utilities/logger';

interface CoursePageProps {

}

export const CoursePage: React.FC<CoursePageProps> = () => {
    const [courses, setCourses] = useState<Array<CourseObject>>([]);
    const userType: UserRole = getUserRole();
    const userId: string | undefined = Cookies.get(CookieEnum.USERID);

    // Get the list of courses to render.
    useEffect(() => {
        logger.info(`is nil, ${userId}`);
        if (_.isNil(userId) || userId === 'undefined') {
            logger.error('Missing userId cookie.');
            return;
        }

        (async () => {
            try {
                const idParams = getCourseIdParamFromRole(userType, parseInt(userId, 10));
                logger.info(`converted ${userId} to ${idParams}`);
                let res = await AxiosRequest.get(`/courses?${idParams}`);
                logger.info(res.data.data);
                const courses: Array<CourseObject> = map(res.data?.data, obj => new CourseObject(obj));

                setCourses(courses);
            } catch (e) {
                logger.info(e.response);
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