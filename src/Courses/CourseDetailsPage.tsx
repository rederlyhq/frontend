import React from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import TopicsList from './TopicsList';

interface CourseDetailsPageProps {

}

enum CourseDetailsTabs {
    TOPICS = "topics",
    ENROLLMENTS = "enrollments"
}

/**
 * This page renders a tabbed view of course details. If a user is a professor, this will have an additional tab
 * to view enrolled students and send emails.
 * @param param0 
 */
export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({}) => {
    const { id } = useParams();

    const mock_topics = ["addition", "subtraction"];

    return (
        <Container>
            <Tabs defaultActiveKey={CourseDetailsTabs.TOPICS} id="course-details-tabs">
                <Tab eventKey={CourseDetailsTabs.TOPICS} title="Topics">
                    <TopicsList listOfTopics={mock_topics} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.ENROLLMENTS} title="Enrollments">
                    <h2>Current Enrollments</h2>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default CourseDetailsPage;