import { CourseObject, UnitObject, NewCourseTopicObj, ProblemObject, NewProblemObject, NewCourseUnitObj } from '../../../Courses/CourseInterfaces';

/* *************** *************** */
/* *********** Courses *********** */
/* *************** *************** */
export interface CreateCourseOptions {
    useCurriculum?: boolean;
    data: Partial<CourseObject>;
}

/* *************** *************** */
/* ************ Units ************ */
/* *************** *************** */
export interface PostCourseUnitOptions {
    data: Partial<NewCourseUnitObj>;
}

export interface PutCourseUnitOptions {
    id: number;
    data: Partial<UnitObject>;
}

export interface DeleteCourseUnitOptions {
    id: number;
}

/* *************** *************** */
/* *********** Topics  *********** */
/* *************** *************** */
export interface PostCourseTopicOptions {
    data: Partial<NewCourseTopicObj>;
}

export interface PutCourseTopicOptions {
    id: number;
    data: Partial<NewCourseTopicObj>;
}

export interface DeleteCourseTopicOptions {
    id: number;
}

/* *************** *************** */
/* ********** Questions ********** */
/* *************** *************** */
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