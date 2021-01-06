import React, { useState } from 'react';
import { CourseDetailsForm } from './CourseDetailsForm';
import { CourseObject } from '../CourseInterfaces';
import { Alert } from '@material-ui/lab';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import * as qs from 'querystring';

interface CourseDetailsProps {
    course: CourseObject;
    updateCourseValue?: (field: keyof CourseObject, value: any) => void;
    disabled?: boolean;
    onBlur?: ((field: keyof CourseObject, value: any) => void)
}

export const EditableCourseDetailsForm: React.FC<CourseDetailsProps> = ({ course, updateCourseValue: updateCourseValueProp = () => { }, disabled = false, onBlur: onBlurProp = () => {} }) => {
    const [currentCourseState, setCurrentCourseState] = useState<CourseObject>(course);
    const onBlur = (field: keyof CourseObject, value: any) => {
        setCurrentCourseState({ ...currentCourseState, [field]: value });
        onBlurProp(field, value);
    };

    const updateCourseValue = (field: keyof CourseObject, value: any) => {
        setCurrentCourseState({ ...currentCourseState, [field]: value });
        updateCourseValueProp(field, value);
    };

    // It might make sense to have a use effect that if the course changes the form updates
    // However overriding what the user has done might be annoying

    const unitsWithErrors: number[] = [];
    const hasErrors = _.sumBy(course.units, unit => {
        const errorsInUnit = _.sumBy(unit.topics, 'errors');
        if (errorsInUnit > 0) unitsWithErrors.push(unit.id);
        return errorsInUnit;
    });

    return (
        <>
            {hasErrors && 
                <Link to={`/common/courses/${course.id}?${qs.stringify({tab: 'Topics', unitId: unitsWithErrors})}`}>
                    <Alert severity='warning'>
                        This course has <b>{hasErrors}</b> questions with errors. Click here to fix them.
                    </Alert>
                </Link>}
            <CourseDetailsForm course={currentCourseState} updateCourseValue={updateCourseValue} disabled={disabled} onBlur={onBlur} />
        </>
    );
};
