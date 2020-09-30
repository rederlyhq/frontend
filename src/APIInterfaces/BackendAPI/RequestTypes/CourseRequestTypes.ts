import { CourseObject, UnitObject, NewCourseTopicObj, ProblemObject, NewProblemObject, NewCourseUnitObj, StudentGrade } from '../../../Courses/CourseInterfaces';
import { Moment } from 'moment';

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
export interface GetCourseTopicOptions {
    id: number;
    userId: number | undefined;
}

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

export interface ExtendCourseTopicForUser {
    courseTopicContentId: number;
    userId: number;
    extensions: {startDate: Moment, endDate: Moment, deadDate: Moment};
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

export interface PostDefFileOptions {
    acceptedFiles: any;
    courseTopicId: number;
}

export interface GetQuestionOptions {
    id: number;
    userId?: number;
}

export interface GetQuestionsOptions {
    userId: number | 'me';
    courseTopicContentId: number;
}

export interface DeleteEnrollmentOptions {
    userId: number;
    courseId: number;
}

export interface ExtendCourseTopicQuestionsForUser {
    courseTopicQuestionId: number;
    userId: number;
    extensions: {maxAttempts: number};
}