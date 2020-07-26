import React, { useEffect, useState, useRef } from 'react';
import { Button, Container, Tabs, Tab, InputGroup, FormControl, FormLabel } from 'react-bootstrap';
import EnrollmentsTab from './CourseDetailsTabs/EnrollmentsTab';
import TopicsTab from './CourseDetailsTabs/TopicsTab';
import { useParams } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';
import GradesTab from './CourseDetailsTabs/GradesTab';
import { Bar, Line } from 'react-chartjs-2';
import StatisticsTab from './CourseDetailsTabs/StatisticsTab';
import { DragDropContext } from 'react-beautiful-dnd';
import { UserRole, getUserRole } from '../Enums/UserRole';
import Cookies from 'js-cookie';
import { CookieEnum } from '../Enums/CookieEnum';

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
    const [course, setCourse] = useState<any>({});
    const [activeTab, setActiveTab] = useState<CourseDetailsTabs>(CourseDetailsTabs.DETAILS);
    const userType: UserRole = getUserRole(Cookies.get(CookieEnum.USERTYPE));

    useEffect(() => {
        (async () => {
            if (!courseId) return;

            const courseResp = await AxiosRequest.get(`/courses/${courseId}`);
            console.log(courseResp.data);
            setCourse(courseResp.data.data);
        })();
    }, [courseId]);

    if (!courseId) return <div>Please return to login.</div>;

    return (
        <Container>
            <Tabs activeKey={activeTab} defaultActiveKey={CourseDetailsTabs.DETAILS} id="course-details-tabs" onSelect={(activeTab: any) => setActiveTab(activeTab)}>
                <Tab eventKey={CourseDetailsTabs.DETAILS} title={CourseDetailsTabs.DETAILS}>
                    {course && (
                        <>
                            <h1>{course.name}</h1>
                            <p>Course description content goes here.</p>

                            <Line data={{
                                labels: ['10','20','30','40','50','60','70','80','90','100',],
                                datasets: [{
                                    label: 'Student completion rate',
                                    data: [85, 80, 75, 60, 45, 40, 40, 20, 5, 0],
                                    backgroundColor: 'rgba(25,132,99,.5)',
                                }]
                            }} options={{
                                scales: {
                                    xAxes: [{
                                        display: true,
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Completion of topic'
                                        }
                                    }],
                                    yAxes: [{
                                        display: true,
                                        scaleLabel: {
                                            display: true,
                                            labelString: 'Percentage of students'
                                        }
                                    }]
                                }
                            }} />

                            <Bar data={{
                                labels: ['Problem 1', 'Problem 2', 'Problem 3', 'Problem 4', 'Problem 5', 'Problem 6', 'Problem 7', 'Problem 8', 'Problem 9', 'Problem 10'],
                                datasets: [{
                                    label: 'Average attempts',
                                    stack: 'Average attempts',
                                    data: [3, 5, 1, 3, 5, 7, 10, 8, 3, 0],
                                    backgroundColor: 'rgba(25,99,132,.5)',
                                    borderColor: 'rgba(25,99,132,1)',
                                },
                                ],
                            }} options={{
                                scales: {
                                    xAxes: [{
                                        stacked: true
                                    }],
                                    yAxes: [{
                                        stacked: true
                                    }]
                                }
                            }} />
                        </>
                    )
                    }
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