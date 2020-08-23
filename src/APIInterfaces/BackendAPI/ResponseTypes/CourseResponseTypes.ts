import { CourseObject } from '../../../Courses/CourseInterfaces';
import { BackendAPIResponse } from '../BackendAPIResponse';

export type CreateCourseResponse = BackendAPIResponse<Partial<CourseObject>>;
