import React, { useEffect, useState } from 'react';
import CourseList from './CourseList';
import AxiosRequest from '../Hooks/AxiosRequest';
import { map } from 'lodash';
import { CourseObject } from './CourseInterfaces';
import { Container, Row, Button, Col } from 'react-bootstrap';
import { BsPlusSquare } from 'react-icons/bs';
import Cookies from 'js-cookie';
import { UserRole, getUserRole } from '../Enums/UserRole';

interface CoursePageProps {

}

export const CoursePage: React.FC<CoursePageProps> = () => {
    const [courses, setCourses] = useState<Array<CourseObject>>([]);
    const userType: UserRole = getUserRole(Cookies.get('userType'));

    // Get the list of courses to render.
    useEffect(() => {
        (async () => {
            try {
                let res = await AxiosRequest.get('/courses');
                console.log(res.data.data);
                const courses: Array<CourseObject> = map(res.data?.data, obj => new CourseObject(obj));

                setCourses(courses);
            } catch (e) {
                console.log(e.response);
                setCourses([]);
            }
        })();
    }, []);

    return (
        <div>
            <Container>
                <Row>
                    <Col md={10}>
                        <h1>My Courses</h1>
                    </Col>
                    <Col md={2}>
                        {userType === UserRole.PROFESSOR && (
                            <Button className="float-right" style={{height: '100%'}}><BsPlusSquare /> Create Course</Button>
                        )}
                    </Col>
                </Row>
                <CourseList courses={courses}/>
            </Container>
        </div>
    );
};
export default CoursePage;