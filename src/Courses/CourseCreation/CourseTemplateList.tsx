import React from 'react';
import { ListGroup, ListGroupItem, Col, Button, Row } from 'react-bootstrap';
import { ICourseTemplate } from '../CourseInterfaces';

interface CourseTemplateListProps {
    courseTemplates: Array<ICourseTemplate>
}

/**
 * Renders a list of ICourseTemplate objects with options for more information 
 * and a Clone button to create a course from it, and launch into a Course Editing screen.
 * 
 */
export const CourseTemplateList: React.FC<CourseTemplateListProps> = ({courseTemplates}) => {
    return (
        <ListGroup>
            {courseTemplates.map(template => (
                <ListGroupItem
                    key={template.id}
                    style={{cursor: 'pointer'}}
                    onClick={() => {}}
                >
                    <Row>
                        <Col>
                            {template.name}
                        </Col>
                        <Col>
                            <Button className="float-right">Details</Button>
                        </Col>
                    </Row>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default CourseTemplateList;