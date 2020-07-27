import React from 'react';
import { ListGroup, ListGroupItem, Col, Row } from 'react-bootstrap';
import { ICourseTemplate } from '../CourseInterfaces';
import { BsChevronCompactRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import CurriculumDetailsModal from './CurriculumDetailsModal';

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
                    key={`template${template.id}`}
                    style={{cursor: 'pointer'}}
                    onClick={() => {}}
                >
                    <Row>
                        <Col as={Link} md={9} to={`/common/courses/edit/${template.id}`}>
                            {template.name}
                        </Col>
                        <Col md={2}>
                            <CurriculumDetailsModal title={template.name} desc={template.comment} className='float-right'/>
                        </Col>
                        <Col as={Link} md={1} to={`/common/courses/edit/${template.id}`}>
                            <BsChevronCompactRight className="float-right" />
                        </Col>
                    </Row>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default CourseTemplateList;