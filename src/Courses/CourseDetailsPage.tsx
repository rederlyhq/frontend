import React, { useContext } from 'react';
import { Container, Tabs, Tab, Button, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import TopicsList from './TopicsList';
import CourseUsersList from './CourseUsersList';
import { UserObject } from './CourseInterfaces';
import { userContext } from '../NavWrapper/NavWrapper';

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
export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = ({}) => {
    const { id } = useParams();
    const { userType } = useContext(userContext);

    const mock_topics = ["addition", "subtraction", "multiplication", "english"];
    const mock_users = [
        new UserObject({first_name: 'Scott', last_name: 'Summers'}),
        new UserObject({first_name: 'Henry', last_name: 'McCoy'}),
        new UserObject({first_name: 'Jean', last_name: 'Grey'}),
        new UserObject({first_name: 'Anne', last_name: 'LeBeau'}),
    ];

    return (
        <Container>
            <Tabs defaultActiveKey={CourseDetailsTabs.TOPICS} id="course-details-tabs">
                <Tab eventKey={CourseDetailsTabs.TOPICS} title="Topics">
                    <h2>Unit 1</h2>
                    <TopicsList listOfTopics={mock_topics} />
                    <br/>
                    <h2>Unit 2</h2>
                    <TopicsList listOfTopics={mock_topics} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.ENROLLMENTS} title="Enrollments">
                    <Row>
                        <Col md={10}>
                            <h2>Current Enrollments</h2>
                        </Col>
                        <Col md={2}>
                            {userType === 'Professor' && <Button className="email float-right">Email Students</Button>}
                        </Col>
                    </Row>
                    <CourseUsersList users={mock_users} />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default CourseDetailsPage;