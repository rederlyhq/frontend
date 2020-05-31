import React, { useEffect, useState, useRef } from 'react';
import { Button, Container, Tabs, Tab, InputGroup, FormControl, FormLabel } from 'react-bootstrap';
import EnrollmentsTab from './CourseDetailsTabs/EnrollmentsTab';
import TopicsTab from './CourseDetailsTabs/TopicsTab';
import { useParams } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';

interface CourseDetailsPageProps {

}

enum CourseDetailsTabs {
    TOPICS = 'topics',
    ENROLLMENTS = 'enrollments',
    DETAILS = 'details'
}

/**
 * This page renders a tabbed view of course details. If a user is a professor, this will have an additional tab
 * to view enrolled students and send emails.
 *
 */
export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<any>({});
    const textAreaRef = useRef(null);
    const enrollUrl: string = `${window.location.host}/courses/enroll/${course?.code}`;
    
    useEffect(() => {
        (async ()=>{
            if (!courseId) return;

            const courseResp = await AxiosRequest.get(`/courses/${courseId}`);
            console.log(courseResp.data);
            setCourse(courseResp.data.data);
        })();
    }, [courseId]);

    if (!courseId) return <div>Please return to login.</div>;

    const copyToClipboard = (e: any) => {
        if (!textAreaRef) {
            console.error('enrollLinkRef not logged properly.');
            return;
        }
        console.log(textAreaRef);
        (textAreaRef?.current as any).select();

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
            <Tabs defaultActiveKey={CourseDetailsTabs.DETAILS} id="course-details-tabs">
                <Tab eventKey={CourseDetailsTabs.DETAILS} title="Details">
                    {course && (
                        <>
                            <h1>{course.name}</h1>
                            <p>Course description content goes here.</p>

                            <FormLabel>Enrollment Link:</FormLabel>
                            <InputGroup className="mb-3">
                                <FormControl
                                    readOnly
                                    aria-label="Enrollment link"
                                    aria-describedby="basic-addon2"
                                    ref={textAreaRef}
                                    value={`https://${enrollUrl}`}
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
                    <EnrollmentsTab courseId={parseInt(courseId, 10)}/>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default CourseDetailsPage;