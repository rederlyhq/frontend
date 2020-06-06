import React, { useEffect, useState, useCallback } from 'react';
import { ICourseTemplate } from '../CourseInterfaces';
import CourseTemplateList from './CourseTemplateList';
import { FormControl, Button, Container, Row, Col } from 'react-bootstrap';
import EnterRightAnimWrapper from './EnterRightAnimWrapper';
import {useDropzone} from 'react-dropzone';
import AxiosRequest from '../../Hooks/AxiosRequest';

import './Course.css';

interface CourseCreationPageProps {
    
}

/**
 * This page prompts a user to create a new course from an existing template.
 * It renders a list of possible templates and a create button.
 * 
 */
export const CourseCreationPage: React.FC<CourseCreationPageProps> = () => {
    const [courseTemplates, setCourseTemplates] = useState<Array<ICourseTemplate>>([]);
    const [filteredCourseTemplates, setFilteredCourseTemplates] = useState<Array<ICourseTemplate>>([]);

    useEffect(() => {
        (async () => {
            // TODO: Get courses as well.
            let templatesResponse = await AxiosRequest.get('/curriculum');
            let templates = templatesResponse.data.data;
            setCourseTemplates(templates);
            setFilteredCourseTemplates(templates);
        })();
    }, []);

    const filterCourseTemplates = (e: any) => {
        setFilteredCourseTemplates(courseTemplates.filter(template => (
            template.name.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1
        )));
    };
    
    return (
        <EnterRightAnimWrapper>
            <Container>
                <>
                    <FormControl type="search" placeholder="Search by Course or Curriculum Name" onChange={filterCourseTemplates} />
                    <CourseTemplateList courseTemplates={filteredCourseTemplates} />
                </>
            </Container>
        </EnterRightAnimWrapper>
    );
};

export default CourseCreationPage;