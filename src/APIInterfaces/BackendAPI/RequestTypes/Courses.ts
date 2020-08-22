import { CourseObject } from '../../../Courses/CourseInterfaces';

export interface CreateCourseOptions {
    useCurriculum?: boolean;
    data: Partial<CourseObject>;
}
