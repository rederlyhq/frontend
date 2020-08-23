import { CourseObject, UnitObject } from '../../../Courses/CourseInterfaces';

export interface CreateCourseOptions {
    useCurriculum?: boolean;
    data: Partial<CourseObject>;
}

export interface PutCourseUnitOptions {
    id: number;
    data: Partial<UnitObject>;
}