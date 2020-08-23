import { CourseObject, UnitObject, NewCourseTopicObj, ProblemObject, NewProblemObject } from '../../../Courses/CourseInterfaces';

export interface CreateCourseOptions {
    useCurriculum?: boolean;
    data: Partial<CourseObject>;
}

export interface PutCourseUnitOptions {
    id: number;
    data: Partial<UnitObject>;
}

export interface DeleteCourseUnitOptions {
    id: number;
}

export interface PutCourseTopicOptions {
    id: number;
    data: Partial<NewCourseTopicObj>;
}

export interface DeleteCourseTopicOptions {
    id: number;
}

export interface PutCourseTopicQuestionOptions {
    id: number;
    data: Partial<ProblemObject>;
}

export interface DeleteCourseTopicQuestionOptions {
    id: number;
}

export interface PostCourseTopicQuestionOptions {
    data: Partial<NewProblemObject>;
}

export interface PostDefFileOptions {
    acceptedFiles: any;
    courseTopicId: number;
}