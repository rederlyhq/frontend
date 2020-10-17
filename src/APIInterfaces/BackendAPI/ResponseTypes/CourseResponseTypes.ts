import { CourseObject, UnitObject, TopicObject, ProblemObject, NewProblemObject, StudentGrade } from '../../../Courses/CourseInterfaces';
import { BackendAPIResponse } from '../BackendAPIResponse';

/* *************** *************** */
/* *********** Courses *********** */
/* *************** *************** */
export type CreateCourseResponse = BackendAPIResponse<Partial<CourseObject>>;

interface PutCourseUpdates {
    updatesResult: Partial<CourseObject>[]
}

export type PutCourseUpdatesResponse = BackendAPIResponse<PutCourseUpdates>;

/* *************** *************** */
/* ************ Units ************ */
/* *************** *************** */
export type PostUnitResponse = BackendAPIResponse<Partial<UnitObject>>;

interface PutCourseUnitUpdates {
    updatesResult: Partial<UnitObject>[]
}

export type PutCourseUnitUpdatesResponse = BackendAPIResponse<PutCourseUnitUpdates>;

/* *************** *************** */
/* *********** Topics  *********** */
/* *************** *************** */
export type GetTopicResponse = BackendAPIResponse<Partial<TopicObject>>;

export type PostTopicResponse = BackendAPIResponse<Partial<TopicObject>>;

interface PutCourseTopicUpdates {
    updatesResult: Partial<TopicObject>[]
}

export type PutCourseTopicUpdatesResponse = BackendAPIResponse<PutCourseTopicUpdates>;

/* *************** *************** */
/* ********** Questions ********** */
/* *************** *************** */
export type CreateQuestionResponse = BackendAPIResponse<Partial<NewProblemObject>>;

interface PostQuestionSubmission {
    studentGrade: Partial<StudentGrade>;
    rendererData: {
        renderedHTML: string;
    }
}

export type PostQuestionSubmissionResponse = BackendAPIResponse<PostQuestionSubmission>;

interface PutCourseTopicQuestionUpdates {
    updatesResult: Partial<ProblemObject>[]
}

export type PutCourseTopicQuestionUpdatesResponse = BackendAPIResponse<PutCourseTopicQuestionUpdates>;

interface PutQuestionGrade {
    updatesResult: {
        updatedRecords: Partial<StudentGrade>[]
    }
    updatesCount: number;
}

export type PutQuestionGradeResponse = BackendAPIResponse<PutQuestionGrade>;

interface PostDefFile {
    newQuestions: ProblemObject[]
}

export type PostDefFileResponse = BackendAPIResponse<PostDefFile>;

interface GetQuestions {
    questions: Array<ProblemObject>;
    topic: TopicObject
}
export type GetQuestionsResponse = BackendAPIResponse<GetQuestions>;

export type GetQuestionResponse = BackendAPIResponse<Partial<ProblemObject>>;
