import React, { useState } from 'react';
import { ListGroup, ListGroupItem, Col, Row } from 'react-bootstrap';
import { ICourseTemplate } from '../CourseInterfaces';
import _ from 'lodash';
import { CreateCourseModal } from './CreateCourseModal';

interface CourseTemplateListProps {
    courseTemplates: Array<ICourseTemplate>;
}

/**
 * Renders a list of ICourseTemplate objects with options for more information 
 * and a Clone button to create a course from it, and launch into a Course Editing screen.
 * 
 */
export const CourseTemplateList: React.FC<CourseTemplateListProps> = ({ courseTemplates }) => {
    const [templateObject, setTemplateObject] = useState<ICourseTemplate | null>(null);

    return (
        <>
            <CreateCourseModal show={!_.isNil(templateObject)} onHide={() => setTemplateObject(null)} courseTemplate={templateObject} />
            <ListGroup>
                {courseTemplates.map(template => (
                    <ListGroupItem
                        key={`template${template.id}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => { setTemplateObject(template); }}
                    >
                        <Row>
                            <Col>
                                {template.name}
                            </Col>
                            {/* <Col md={2}>
                                <CurriculumDetailsModal title={template.name} desc={template.comment} className='float-right' />
                            </Col> */}
                        </Row>
                    </ListGroupItem>
                ))}
            </ListGroup>
        </>
    );
};

export default CourseTemplateList;