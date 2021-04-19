import React, { useEffect, useState } from 'react';
import { ICourseTemplate } from '../CourseInterfaces';
import CourseTemplateList from './CourseTemplateList';
import { FormControl, Container } from 'react-bootstrap';
import EnterRightAnimWrapper from './EnterRightAnimWrapper';
import AxiosRequest from '../../Hooks/AxiosRequest';

import './Course.css';
import { Tabs, Tab } from '@material-ui/core';
import { getUserId } from '../../Enums/UserRole';

interface CourseCreationPageProps {

}

enum TemplateType {
    CURRICULA,
    PERSONAL_COURSES,
}

/**
 * This page prompts a user to create a new course from an existing template.
 * It renders a list of possible templates and a create button.
 *
 */
export const CourseCreationPage: React.FC<CourseCreationPageProps> = () => {
    const [templateType, setTemplateType] = useState<TemplateType>(TemplateType.CURRICULA);
    const [courseTemplates, setCourseTemplates] = useState<Array<ICourseTemplate>>([]);
    const [filteredCourseTemplates, setFilteredCourseTemplates] = useState<Array<ICourseTemplate>>([]);

    useEffect(() => {
        (async () => {
            let url = '/courses?instructorId=' + getUserId();
            if (templateType === TemplateType.CURRICULA) {
                url = '/curriculum';
            }
            const templatesResponse = await AxiosRequest.get(url);
            const templates = templatesResponse.data.data;
            setCourseTemplates(templates);
            setFilteredCourseTemplates(templates);
        })();
    }, [templateType]);

    const filterCourseTemplates = (e: any) => {
        setFilteredCourseTemplates(courseTemplates.filter(template => (
            template.name.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1
        )));
    };

    return (
        <EnterRightAnimWrapper>
            <Container>
                <Tabs value={templateType} onChange={(e, val) => setTemplateType(val)} aria-label="Course creation options.">
                    <Tab label={'Institutional Curricula'} />
                    <Tab label={'Global Curricula'} />
                    <Tab label={'Active Courses'} />
                    <Tab label={'Past Courses'} />
                </Tabs>
                <FormControl type="search" placeholder="Search by Course or Curriculum Name" onChange={filterCourseTemplates} />
                <CourseTemplateList courseTemplates={filteredCourseTemplates} />
            </Container>
        </EnterRightAnimWrapper>
    );
};

export default CourseCreationPage;