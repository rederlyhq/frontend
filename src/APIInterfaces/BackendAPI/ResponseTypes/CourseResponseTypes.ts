import { CourseObject, UnitObject, TopicObject, ProblemObject, StudentGrade, StudentGradeInstance, ProblemAttachments } from '../../../Courses/CourseInterfaces';
import { BackendAPIResponse } from '../BackendAPIResponse';

/* *************** *************** */
/* *********** Courses *********** */
/* *************** *************** */
export type CreateCourseResponse = BackendAPIResponse<Partial<CourseObject>>;

interface PostImportCourseArchive {
    unit: UnitObject;
    missingFileErrors: {
        missingPGFileErrors: Array<string>;
        missingAssetFileErrors: Array<string>;
    };
}
export type PostImportCourseArchiveResponse = BackendAPIResponse<PostImportCourseArchive>;

interface PutCourseUpdates {
    updatesResult: Partial<CourseObject>[]
}

export type PutCourseUpdatesResponse = BackendAPIResponse<PutCourseUpdates>;

interface SuccessResponse {
    message: string;
}

export type PostEmailProfResponse = BackendAPIResponse<SuccessResponse>;

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
export type CreateQuestionResponse = BackendAPIResponse<Partial<ProblemObject>>;

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

interface PutQuestionGradeInstance {
    updatesResult: {
        updatedRecords: Partial<StudentGradeInstance>[]
    }
    updatesCount: number;
}

export type PutQuestionGradeInstanceResponse = BackendAPIResponse<PutQuestionGradeInstance>;

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

/* *************** *************** */
/* ********** Questions ********** */
/* *************** *************** */

interface GetUploadURL {
    uploadURL: URL;
    cloudFilename: string;
}

export type GetUploadURLResponse = BackendAPIResponse<GetUploadURL>;

interface ListAttachmentsInterface {
    attachments: ProblemAttachments[];
    baseUrl: string;
}

export type ListAttachmentsResponse = BackendAPIResponse<ListAttachmentsInterface>;

export interface GetAllVersionAttachmentsResponse {
    baseUrl: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
    },
    topic: {
        id: number;
        name: string;
        questions: {
            id: number;
            problemNumber: number;
            grades: {
                id: number;
                lastInfluencingCreditedAttemptId: number;
                lastInfluencingAttemptId: number;
                webworkQuestionPath: string;
                problemAttachments?: {
                    id: number;
                    cloudFilename: string;
                    userLocalFilename: string;
                    updatedAt: Date;
                }[];
            }[];
        }[];
    }
}

export type GetAllVersionDataResponse = BackendAPIResponse<GetAllVersionAttachmentsResponse>;

/* *************** *************** */
/* *********** Editor  *********** */
/* *************** *************** */
interface ReadQuestion {
    problemSource: string;
}
export type ReadQuestionResponse = BackendAPIResponse<ReadQuestion>;

export interface SaveQuestion {
    filePath: string;
}
export type SaveQuestionResponse = BackendAPIResponse<SaveQuestion>;

export interface Catalog {
    problems: Array<string>;
}
export type CatalogResponse = BackendAPIResponse<Catalog>;

/* *************** *************** */
/* *********** Grades  *********** */
/* *************** *************** */
type Grades = Array<{
    average: number;
}>
export type GradesResponse = BackendAPIResponse<Grades>;

/* *************** *************** */
/* ********* Enrollment  ********* */
/* *************** *************** */
type EnrollByCode = {
    courseId: number;
};
export type EnrollByCodeResponse = BackendAPIResponse<EnrollByCode>;
