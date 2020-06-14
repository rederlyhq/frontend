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
    const textAreaRef = useRef<FormControl<'input'> & HTMLInputElement>(null);
    const enrollUrl: string = `${window.location.host}/common/courses/enroll/${course?.code}`;

    useEffect(() => {
        (async () => {
            if (!courseId) return;

            const courseResp = await AxiosRequest.get(`/courses/${courseId}`);
            console.log(courseResp.data);
            setCourse(courseResp.data.data);
        })();
    }, [courseId]);

    if (!courseId) return <div>Please return to login.</div>;

    const copyToClipboard = (e: any) => {
        if (textAreaRef?.current === null) {
            console.error('enrollLinkRef not logged properly.');
            return;
        }
        console.log(textAreaRef);
        textAreaRef?.current.select();

        try {
            const res = document.execCommand('copy');
            console.log(`Copy operation ${res ? 'was successful' : 'failed'}`);
        } catch (err) {
            console.error(err);
        } finally {
            e.target.focus();
        }

    };

    return (
        <Container>
            <Tabs activeKey={activeTab} defaultActiveKey={CourseDetailsTabs.DETAILS} id="course-details-tabs" onSelect={(activeTab: any) => setActiveTab(activeTab)}>
                <Tab eventKey={CourseDetailsTabs.DETAILS} title="Details">
                    {course && (
                        <>
                            <h1>{course.name}</h1>
                            <p>Course description content goes here.</p>

                            <Bar data={{
                                labels: ['Mary Jane', 'Peter Parker', 'Carnage', 'Dr. X'],
                                datasets: [{
                                    label: 'Math 120',
                                    stack: 'Math 120',
                                    data: [2, 2, 100, 100],
                                    backgroundColor: 'rgba(255,99,132,0.2)',
                                    borderColor: 'rgba(255,99,132,1)',
                                },
                                {
                                    label: 'Math 131',
                                    stack: 'Math 131',
                                    data: [20, 10, 80, 80],
                                    backgroundColor: 'rgba(25,99,132,0.2)',
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

                            <FormLabel>Enrollment Link:</FormLabel>
                            <InputGroup className="mb-3">
                                <FormControl
                                    readOnly
                                    aria-label="Enrollment link"
                                    aria-describedby="basic-addon2"
                                    ref={textAreaRef}
                                    value={`http://${enrollUrl}`}
                                />
                                <InputGroup.Append>
                                    <Button variant="outline-secondary" onClick={copyToClipboard}>Copy to Clipboard</Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </>
                    )
                    }
                </Tab>
                <Tab eventKey={CourseDetailsTabs.TOPICS} title="Topics">
                    <TopicsTab course={course} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.ENROLLMENTS} title="Enrollments">
                    <EnrollmentsTab courseId={parseInt(courseId, 10)} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.GRADES} title="Grades">
                    <GradesTab course={course} />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default CourseDetailsPage;