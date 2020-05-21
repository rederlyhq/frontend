import React, { useEffect, useState } from 'react';
import { ICourseTemplate } from '../CourseInterfaces';
import CourseTemplateList from './CourseTemplateList';
import { FormControl } from 'react-bootstrap';
import EnterRightAnimWrapper from './EnterRightAnimWrapper';

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
        const mock_templates: Array<ICourseTemplate> = [
            {name: 'Curriculum 1', id: 1}, 
            {name: 'Course 1', id: 2},
            {name: 'Rederly Default Curriculum', id: 3}
        ];
        setCourseTemplates(mock_templates);
        setFilteredCourseTemplates(mock_templates);
    }, []);

    const filterCourseTemplates = (e: any) => {
        setFilteredCourseTemplates(courseTemplates.filter(template => (
            template.name.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1
        )));
    };
    
    return (
        <EnterRightAnimWrapper>
            <h1>Select a course template:</h1>
            <FormControl type="search" placeholder="Search by Course or Curriculum Name" onChange={filterCourseTemplates} />
            <CourseTemplateList courseTemplates={filteredCourseTemplates} />
        </EnterRightAnimWrapper>
    );
};

export default CourseCreationPage;