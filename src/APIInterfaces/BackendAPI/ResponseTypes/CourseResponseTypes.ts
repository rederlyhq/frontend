import { CourseObject, UnitObject, NewCourseTopicObj, ProblemObject, NewProblemObject } from '../../../Courses/CourseInterfaces';
import { BackendAPIResponse } from '../BackendAPIResponse';

/* *************** *************** */
/* *********** Courses *********** */
/* *************** *************** */
export type CreateCourseResponse = BackendAPIResponse<Partial<CourseObject>>;

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
export type CreateTopicResponse = BackendAPIResponse<Partial<NewCourseTopicObj>>;

interface PutCourseTopicUpdates {
    updatesResult: Partial<NewCourseTopicObj>[]
}

export type PutCourseTopicUpdatesResponse = BackendAPIResponse<PutCourseTopicUpdates>;

interface PutCourseTopicQuestionUpdates {
    updatesResult: Partial<ProblemObject>[]
}

/* *************** *************** */
/* ********** Questions ********** */
/* *************** *************** */
export type CreateQuestionResponse = BackendAPIResponse<Partial<NewProblemObject>>;

export type PutCourseTopicQuestionUpdatesResponse = BackendAPIResponse<PutCourseTopicQuestionUpdates>;

interface PostDefFile {
    newQuestions: ProblemObject[]
}

export type PostDefFileResponse = BackendAPIResponse<PostDefFile>;
