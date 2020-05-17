import React from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import EnrollmentsTab from './CourseDetailsTabs/EnrollmentsTab';
import TopicsTab from './CourseDetailsTabs/TopicsTab';

interface CourseDetailsPageProps {

}

enum CourseDetailsTabs {
    TOPICS = 'topics',
    ENROLLMENTS = 'enrollments'
}

/**
 * This page renders a tabbed view of course details. If a user is a professor, this will have an additional tab
 * to view enrolled students and send emails.
 * @param param0 
 */
export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = () => {
    return (
        <Container>
            <Tabs defaultActiveKey={CourseDetailsTabs.TOPICS} id="course-details-tabs">
                <Tab eventKey={CourseDetailsTabs.TOPICS} title="Topics">
                    <TopicsTab />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.ENROLLMENTS} title="Enrollments">
                    <EnrollmentsTab />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default CourseDetailsPage;