import React, { useEffect, useState } from 'react';
import { ICourseTemplate } from '../CourseInterfaces';
import CourseTemplateList from './CourseTemplateList';
import { FormControl, Container } from 'react-bootstrap';
import EnterRightAnimWrapper from './EnterRightAnimWrapper';
import AxiosRequest from '../../Hooks/AxiosRequest';

import './Course.css';
import { Tabs, Tab } from '@material-ui/core';
import { getUserId } from '../../Enums/UserRole';
import ListCoursesFilters from '../../Enums/ListCoursesEnum';
import ListCurriculumFilters from '../../Enums/ListCurriculumEnum';

interface CourseCreationPageProps {

}

export enum TemplateType {
    GLOBAL_CURRICULA,
    INSTITUTIONAL_CURRICULA,
    ACTIVE_COURSES,
    PAST_COURSES,
}

/**
 * This page prompts a user to create a new course from an existing template.
 * It renders a list of possible templates and a create button.
 *
 */
export const CourseCreationPage: React.FC<CourseCreationPageProps> = () => {
    const [templateType, setTemplateType] = useState<TemplateType>(TemplateType.INSTITUTIONAL_CURRICULA);
    const [courseTemplates, setCourseTemplates] = useState<Array<ICourseTemplate>>([]);
    const [filteredCourseTemplates, setFilteredCourseTemplates] = useState<Array<ICourseTemplate>>([]);

    useEffect(() => {
        (async () => {
            let url = '/courses?instructorId=' + getUserId();
            switch(templateType) {
            case TemplateType.INSTITUTIONAL_CURRICULA:
                url = `/curriculum/?filterOptions=${ListCurriculumFilters.INSTITUTIONAL}`;
                break;
            case TemplateType.GLOBAL_CURRICULA:
                url = `/curriculum/?filterOptions=${ListCurriculumFilters.GLOBAL}`;
                break;
            case TemplateType.ACTIVE_COURSES:
                url = `/courses?instructorId=${getUserId()}&filterOptions=${ListCoursesFilters.ACTIVE}`;
                break;
            case TemplateType.PAST_COURSES:
                url = `/courses?instructorId=${getUserId()}&filterOptions=${ListCoursesFilters.PAST}`;
                break;       
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
                    <Tab value={TemplateType.INSTITUTIONAL_CURRICULA} label={'Institutional Curricula'} />
                    <Tab value={TemplateType.GLOBAL_CURRICULA} label={'Global Curricula'} />
                    <Tab value={TemplateType.ACTIVE_COURSES} label={'Active Courses'} />
                    <Tab value={TemplateType.PAST_COURSES} label={'Past Courses'} />
                </Tabs>
                <FormControl type="search" placeholder="Search by Course or Curriculum Name" onChange={filterCourseTemplates} />
                <CourseTemplateList courseTemplates={filteredCourseTemplates} templateType={templateType} />
            </Container>
        </EnterRightAnimWrapper>
    );
};

export default CourseCreationPage;