import { CourseObject, UnitObject, TopicObject, ProblemObject, StudentGrade, StudentGradeInstance, ProblemAttachments, UserObject } from '../../../Courses/CourseInterfaces';
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

export type TopicGradeForCourse = {
    name: string;
    'total problem weight': string;
    'required problem weight': string;
} & {
    [key: string]: string
};

interface TopicGradesForCourseResponse {
    topics: Array<TopicGradeForCourse>;
}
export type GetTopicGradesForCourseResponse = BackendAPIResponse<TopicGradesForCourseResponse>;


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

interface GetStudentGrades {
    data: {
        id: number;
        name: string;
        averageAttemptedCount: string;
        averageScore: number;
        pointsEarnedOpen: number;
        pointsAvailableOpen: string | number,
        averageScoreOpen: number;
        pointsEarnedDead: number;
        pointsAvailableDead: string | number,
        averageScoreDead: number;
        systemScore: number;
        totalGrades: string | number,
        completedCount: string | number,
        completionPercent: number;
        grades: {
            id: number;
            active: boolean;
            userId: number;
            courseWWTopicQuestionId: number;
            lastInfluencingLegalAttemptId: number | null;
            lastInfluencingCreditedAttemptId: number | null;
            lastInfluencingAttemptId: number | null;
            originalRandomSeed: number;
            randomSeed: number;
            bestScore: number;
            overallBestScore: number;
            numAttempts: number;
            numLegalAttempts: number;
            numExtendedAttempts: number;
            firstAttempts: number;
            latestAttempts: number;
            effectiveScore: number;
            partialCreditBestScore: number;
            legalScore: number;
            locked: false,
            currentProblemState: null,
            createdAt: string | Date;
            updatedAt: string | Date;
            user_id: number;
        }[];
    }[];
    totalAverage: number | null;
    totalOpenAverage: number | null;
    totalDeadAverage: number | null;
}
export type GetStudentGradesResponse = BackendAPIResponse<GetStudentGrades>;

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

// export interface 

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

type EnrollManually = {
    user: UserObject;
    enrollment: unknown;
};
export type EnrollManuallyResponse = BackendAPIResponse<EnrollManually>;

/* *************** *************** */
/* ****** Problem  Browsing ****** */
/* *************** *************** */
type GetBrowserProblemsListObject = {
    name: string;
    id: number;
}

type GetBrowseProblemsCourseList = {
    courses: Array<GetBrowserProblemsListObject>;
}
export type GetBrowseProblemsCourseListResponse = BackendAPIResponse<GetBrowseProblemsCourseList>;

type GetBrowseProblemsUnitList = {
    units: Array<GetBrowserProblemsListObject>;
}
export type GetBrowseProblemsUnitListResponse = BackendAPIResponse<GetBrowseProblemsUnitList>;

type GetBrowseProblemsTopicList = {
    topics: Array<GetBrowserProblemsListObject>;
}
export type GetBrowseProblemsTopicListResponse = BackendAPIResponse<GetBrowseProblemsTopicList>;

type GetProblemSearchResults = {
    problems: Array<ProblemObject>
}
export type GetProblemSearchResultsResponse = BackendAPIResponse<GetProblemSearchResults>;