import { CourseObject, UnitObject, NewCourseTopicObj, ProblemObject } from '../../../Courses/CourseInterfaces';

export interface CreateCourseOptions {
    useCurriculum?: boolean;
    data: Partial<CourseObject>;
}

export interface PutCourseUnitOptions {
    id: number;
    data: Partial<UnitObject>;
}

export interface PutCourseTopicOptions {
    id: number;
    data: Partial<NewCourseTopicObj>;
}

export interface PutCourseTopicQuestionOptions {
    id: number;
    data: Partial<ProblemObject>;
}