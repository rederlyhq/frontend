import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab, Spinner, Row, Alert } from 'react-bootstrap';
import EnrollmentsTab from './CourseDetailsTabs/EnrollmentsTab';
import TopicsTab from './CourseDetailsTabs/TopicsTab';
import { useParams } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';
import GradesTab from './CourseDetailsTabs/GradesTab';
import StatisticsTab from './CourseDetailsTabs/StatisticsTab';
import { DragDropContext } from 'react-beautiful-dnd';
import { CourseObject } from './CourseInterfaces';
import ActiveTopics from './CourseDetailsTabs/ActiveTopics';
import { UserRole, getUserRole } from '../Enums/UserRole';
import Cookies from 'js-cookie';
import { CookieEnum } from '../Enums/CookieEnum';
import { CourseDetailsForm } from './CourseCreation/CourseDetailsForm';
import _ from 'lodash';

interface CourseDetailsPageProps {

}

enum CourseDetailsTabs {
    TOPICS = 'Topics',
    ENROLLMENTS = 'Enrollments',
    DETAILS = 'Details',
    GRADES = 'Grades',
    STATISTICS = 'Statistics'
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
    const userType: UserRole = getUserRole(Cookies.get(CookieEnum.USERTYPE));

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

    if (!courseId) return <div>Please return to login.</div>;

    return (
        <Container>
            <Tabs activeKey={activeTab} defaultActiveKey={CourseDetailsTabs.DETAILS} id="course-details-tabs" onSelect={(activeTab: any) => setActiveTab(activeTab)}>
                <Tab eventKey={CourseDetailsTabs.DETAILS} title={CourseDetailsTabs.DETAILS} style={{marginBottom:'10px'}}>
                    {course && <>
                        {(() => {
                            if(loading) return <Row style= {{display: 'flex', justifyContent: 'center', padding: '15px' }}><Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner></Row>;
                            else if(!_.isNil(error)) return <Alert variant="danger">{error}</Alert>;
                            else {
                                return (<>
                                    <CourseDetailsForm disabled={true} course={course} updateCourseValue={() => {}} />
                                    <h5>Open Topics</h5>
                                    <DragDropContext onDragEnd={()=>{}}>
                                        <ActiveTopics course={course} />
                                    </DragDropContext>            
                                </>);
                            }
                        })()}
                    </>}
                </Tab>
                <Tab eventKey={CourseDetailsTabs.TOPICS} title={CourseDetailsTabs.TOPICS}>
                    <DragDropContext onDragEnd={()=>{}}>
                        <TopicsTab course={course} />
                    </DragDropContext>
                </Tab>
                <Tab eventKey={CourseDetailsTabs.ENROLLMENTS} title="Enrollments">
                    <EnrollmentsTab courseId={parseInt(courseId, 10)} courseCode={course.code} />
                </Tab>
                {userType !== UserRole.STUDENT && (
                    <Tab eventKey={CourseDetailsTabs.GRADES} title={CourseDetailsTabs.GRADES}>
                        <GradesTab course={course} />
                    </Tab>)}
                {userType !== UserRole.STUDENT && (
                    <Tab eventKey={CourseDetailsTabs.STATISTICS} title={CourseDetailsTabs.STATISTICS}>
                        <StatisticsTab course={course} />
                    </Tab>)}
            </Tabs>
        </Container>
    );
};

export default CourseDetailsPage;