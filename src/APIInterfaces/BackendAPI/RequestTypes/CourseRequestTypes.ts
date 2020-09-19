import { CourseObject, UnitObject, NewCourseTopicObj, ProblemObject, NewProblemObject, NewCourseUnitObj, StudentGrade } from '../../../Courses/CourseInterfaces';

/* *************** *************** */
/* *********** Courses *********** */
/* *************** *************** */
export interface CreateCourseOptions {
    useCurriculum?: boolean;
    data: Partial<CourseObject>;
}

export interface PutCourseOptions {
    id: number;
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

export interface PutQuestionGradeOptions {
    id: number;
    data: Partial<StudentGrade>;
}

export interface DeleteCourseTopicQuestionOptions {
    id: number;
}

export interface PostCourseTopicQuestionOptions {
    data: Partial<NewProblemObject>;
}

export interface PostQuestionSubmissionOptions {
    id: number;
    data: FormData;
}

export interface PostDefFileOptions {
    acceptedFiles: any;
    courseTopicId: number;
}

export interface GetQuestionsOptions {
    userId: number | 'me';
    courseTopicContentId: number;
}