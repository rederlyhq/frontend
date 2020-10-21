import { CourseObject, UnitObject, TopicObject, ProblemObject, NewProblemObject, NewCourseUnitObj, StudentGrade, StudentGradeInstance } from '../../../Courses/CourseInterfaces';
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
    userId?: number;
    includeQuestions?: boolean;
}

export interface PostCourseTopicOptions {
    data: Partial<TopicObject>;
}

export interface PutCourseTopicOptions {
    id: number;
    data: Partial<TopicObject>;
}

export interface DeleteCourseTopicOptions {
    id: number;
}

export interface ExtendCourseTopicForUser {
    courseTopicContentId: number;
    userId: number;
    topicAssessmentInfoId?: number;
    data: {
        extensions?: {
            startDate?: Moment;
            endDate?: Moment;
            deadDate?: Moment;
        };    
        studentTopicAssessmentOverride?: {
            versionDelay?: number;
            duration?: number;
            maxVersions?: number;
            maxGradedAttemptsPerVersion?: number;
        };
    }
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

export interface PutQuestionGradeInstanceOptions {
    id: number;
    data: Partial<StudentGradeInstance>;
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

export interface GenerateNewVersionOptions {
    topicId: number;
}

export interface SubmitVersionOptions {
    topicId: number;
    versionId: number;
}

export interface EndVersionOptions {
    versionId: number;
}