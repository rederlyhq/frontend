import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import EnrollmentsTab from './CourseDetailsTabs/EnrollmentsTab';
import TopicsTab from './CourseDetailsTabs/TopicsTab';
import { useParams } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';
import GradesTab from './CourseDetailsTabs/GradesTab';
import StatisticsTab from './CourseDetailsTabs/StatisticsTab';
import { CourseObject } from './CourseInterfaces';
import { UserRole, getUserRole, getUserId } from '../Enums/UserRole';
import { CourseDetailsTab } from './CourseDetailsTabs/CourseDetailsTab';
import { useCourseContext } from './CourseProvider';

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

export const courseContext = React.createContext(new CourseObject());

/**
 * This page renders a tabbed view of course details. If a user is a professor, this will have an additional tab
 * to view enrolled students and send emails.
 *
 */
export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = () => {
    const {course, setCourse, error} = useCourseContext();
    const [activeTab, setActiveTab] = useState<CourseDetailsTabs>(CourseDetailsTabs.DETAILS);
    const userType: UserRole = getUserRole();
    const userId: number = getUserId();
    const [studentNameAndId, setStudentNameAndId] = useState<{name: string, userId: number} | null>(null);
    const { Provider } = courseContext;

    const setStudentGradesTab = (studentName: string, studentId: number) => {
        setStudentNameAndId({name: studentName, userId: studentId});
        setActiveTab(CourseDetailsTabs.STUDENT_GRADES);
    };

    if (course.id <= 0) return <Container>Loading your course...</Container>;

    return (
        <Container>
            <Provider value={course}>    
                <Tabs 
                    activeKey={activeTab} 
                    defaultActiveKey={CourseDetailsTabs.DETAILS} 
                    id="course-details-tabs" 
                    onSelect={(activeTab: any) => {
                        setActiveTab(activeTab);
                        setStudentNameAndId(null);
                    }}>
                    <Tab eventKey={CourseDetailsTabs.DETAILS} title={CourseDetailsTabs.DETAILS}  style={{marginBottom:'10px'}}>
                        <CourseDetailsTab course={course} error={error} loading={false} setCourse={setCourse} />
                    </Tab>
                    <Tab eventKey={CourseDetailsTabs.TOPICS} title={CourseDetailsTabs.TOPICS}>
                        <TopicsTab course={course} setCourse={setCourse} />
                    </Tab>
                    <Tab eventKey={CourseDetailsTabs.ENROLLMENTS} title="Enrollments">
                        <EnrollmentsTab />
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
            </Provider>
        </Container>
    );
};

export default CourseDetailsPage;