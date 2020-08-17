import React, { useState } from 'react';
import { CourseDetailsForm } from './CourseDetailsForm';
import { CourseObject } from '../CourseInterfaces';

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

    return (
        <CourseDetailsForm course={currentCourseState} updateCourseValue={updateCourseValue} disabled={disabled} onBlur={onBlur} />
    );
};
