import React, { useEffect, useState, useRef } from 'react';
import { Button, Container, Tabs, Tab, InputGroup, FormControl, FormLabel } from 'react-bootstrap';
import EnrollmentsTab from './CourseDetailsTabs/EnrollmentsTab';
import TopicsTab from './CourseDetailsTabs/TopicsTab';
import { useParams } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';
import GradesTab from './CourseDetailsTabs/GradesTab';
import { Bar } from 'react-chartjs-2';

interface CourseDetailsPageProps {

}

enum CourseDetailsTabs {
    TOPICS = 'topics',
    ENROLLMENTS = 'enrollments',
    DETAILS = 'details',
    GRADES = 'grades',
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
                <Tab eventKey={CourseDetailsTabs.DETAILS} title="Details">
                    {course && (
                        <>
                            <h1>{course.name}</h1>
                            <p>Course description content goes here.</p>

                            <Bar data={{
                                labels: ['Problem 1', 'Problem 2', 'Problem 3', 'Problem 4', 'Problem 5', 'Problem 6', 'Problem 7', 'Problem 8', 'Problem 9', 'Problem 10'],
                                datasets: [{
                                    label: 'Average attempts',
                                    stack: 'Average attempts',
                                    data: [3, 5, 1, 3, 5, 7, 10, 8, 3, 0],
                                    backgroundColor: 'rgba(25,99,132,1)',
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
                <Tab eventKey={CourseDetailsTabs.TOPICS} title="Topics">
                    <TopicsTab course={course} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.ENROLLMENTS} title="Enrollments">
                    <EnrollmentsTab courseId={parseInt(courseId, 10)} courseCode={course.code} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.GRADES} title="Grades">
                    <GradesTab course={course} />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default CourseDetailsPage;