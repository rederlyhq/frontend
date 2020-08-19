import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import EnrollmentsTab from './CourseDetailsTabs/EnrollmentsTab';
import TopicsTab from './CourseDetailsTabs/TopicsTab';
import { useParams } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';
import GradesTab from './CourseDetailsTabs/GradesTab';
import StatisticsTab from './CourseDetailsTabs/StatisticsTab';
import { DragDropContext } from 'react-beautiful-dnd';
import { CourseObject } from './CourseInterfaces';
import ActiveTopics from './CourseDetailsTabs/ActiveTopics';
import { UserRole, getUserRole, getUserId } from '../Enums/UserRole';
import Cookies from 'js-cookie';
import { CookieEnum } from '../Enums/CookieEnum';
import _ from 'lodash';
import { CourseDetailsTab } from './CourseDetailsTabs/CourseDetailsTab';

interface CourseDetailsPageProps {

}

enum CourseDetailsTabs {
    TOPICS = 'Topics',
    ENROLLMENTS = 'Enrollments',
    DETAILS = 'Details',
    GRADES = 'Grades',
    STATISTICS = 'Statistics',
    STUDENT_GRADES = 'Student Grades',
}

/**
 * This page renders a tabbed view of course details. If a user is a professor, this will have an additional tab
 * to view enrolled students and send emails.
 *
 */
export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<CourseObject>(new CourseObject());
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<CourseDetailsTabs>(CourseDetailsTabs.DETAILS);
    const userType: UserRole = getUserRole();
    const userId: number = getUserId();
    const [studentNameAndId, setStudentNameAndId] = useState<{name: string, userId: number} | null>(null);

    useEffect(() => {
        (async () => {
            if (!courseId) return;
            setLoading(true);
            setError(null);
            try {
                const courseResp = await AxiosRequest.get(`/courses/${courseId}`);
                const fetchedCourse = new CourseObject(courseResp.data.data);
                setCourse(fetchedCourse);
            } catch (e) {
                setError(e.response.data.message);
            }
            setLoading(false);
        })();
    }, [courseId]);

    const setStudentGradesTab = (studentName: string, studentId: number) => {
        setStudentNameAndId({name: studentName, userId: studentId});
        setActiveTab(CourseDetailsTabs.STUDENT_GRADES);
    };

    if (!courseId) return <div>Please return to login.</div>;

    return (
        <Container>
            <Tabs 
                activeKey={activeTab} 
                defaultActiveKey={CourseDetailsTabs.DETAILS} 
                id="course-details-tabs" 
                onSelect={(activeTab: any) => {
                    setActiveTab(activeTab);
                    setStudentNameAndId(null);
                }}>
                <Tab eventKey={CourseDetailsTabs.DETAILS} title={CourseDetailsTabs.DETAILS}  style={{marginBottom:'10px'}}>
                    <CourseDetailsTab course={course} error={error} loading={loading} setCourse={setCourse} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.TOPICS} title={CourseDetailsTabs.TOPICS}>
                    <DragDropContext onDragEnd={()=>{}}>
                        <TopicsTab course={course} setCourse={setCourse} />
                    </DragDropContext>
                </Tab>
                <Tab eventKey={CourseDetailsTabs.ENROLLMENTS} title="Enrollments">
                    <EnrollmentsTab courseId={parseInt(courseId, 10)} courseCode={course.code} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.GRADES} title={CourseDetailsTabs.GRADES}>
                    {/* Students' Grades view is really the statisics view. */}
                    {userType === UserRole.STUDENT ? 
                        <StatisticsTab course={course} userId={userId} /> : 
                        <GradesTab course={course} setStudentGradesTab={setStudentGradesTab} />}
                </Tab>
                {userType !== UserRole.STUDENT && (
                    <Tab eventKey={CourseDetailsTabs.STATISTICS} title={CourseDetailsTabs.STATISTICS}>
                        <StatisticsTab course={course} />
                    </Tab>)}
                {studentNameAndId !== null && (
                    <Tab eventKey={CourseDetailsTabs.STUDENT_GRADES} title={`${studentNameAndId.name}'s Grades`}>
                        <StatisticsTab course={course} userId={studentNameAndId.userId} />
                    </Tab>)}
            </Tabs>
        </Container>
    );
};

export default CourseDetailsPage;