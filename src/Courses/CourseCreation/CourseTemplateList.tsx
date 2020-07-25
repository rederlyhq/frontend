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
                        <Link to={`/common/courses/edit/${template.id}`}>
                            <Col>
                                {template.name}
                            </Col>
                        </Link>
                        <Col>
                            <CurriculumDetailsModal title={template.name} desc={'TODO: Get description.'} className='float-right'/>
                        </Col>
                        <Link to={`/common/courses/edit/${template.id}`}>
                            <Col md={1} style={{height: '100%'}}>
                                <BsChevronCompactRight className="float-right" style={{height: '100%'}}/>
                            </Col>
                        </Link>
                    </Row>
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default CourseTemplateList;