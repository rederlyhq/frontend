import { CourseObject, UnitObject, TopicObject, ProblemObject, NewCourseUnitObj, StudentGrade, StudentGradeInstance, TOPIC_TYPE_FILTERS } from '../../../Courses/CourseInterfaces';
import { Moment } from 'moment';

/* *************** *************** */
/* *********** Courses *********** */
/* *************** *************** */
export interface CreateCourseOptions {
    useCurriculum?: boolean;
    data: Partial<CourseObject>;
}

export interface PostImportCourseArchiveOptions {
    archiveFile: File;
    courseId: number;
    keepBucketsAsTopics: boolean;
}

export interface PutCourseOptions {
    id: number;
    data: Partial<CourseObject>;
}

export interface PostEmailProfOptions {
    courseId: number;
    content: string;
    question: {
        id: number;
    };
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
    data: Partial<ProblemObject>;
}

export interface PostQuestionSubmissionOptions {
    id: number;
    data: FormData;
}

export interface PostDefFileOptions {
    defFile: File;
    courseTopicId: number;
}

export interface PreviewQuestionOptions {
    webworkQuestionPath?: string;
    problemSource?: string;
    problemSeed?: number;
    showHints?: boolean;
    showSolutions?: boolean;
    formData?: FormData;
}

export interface GetRawQuestionOptions {
    id: number;
    userId?: number;
}

export interface GetQuestionOptions {
    id: number;
    userId?: number;
    workbookId?: number,
    readonly?: boolean,
    studentTopicAssessmentInfoId?: number,
    showCorrectAnswers?: boolean,
}

export interface GetQuestionsOptions {
    userId: number | 'me';
    courseTopicContentId: number;
}

export interface EnrollByCodeOptions {
    enrollCode: string;
}

export interface EnrollStudentOptions {
    studentEmail: string;
    courseId: number;
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

export interface getAssessmentProblemsWithWorkbooksOptions {
    topicId: number;
}

export interface AskForHelpOptions {
    questionId: number;
}

export interface ShowMeAnotherOptions {
    questionId: number;
}

/* *************** *************** */
/* ********* Attachments ********* */
/* *************** *************** */

export interface PostConfirmAttachmentUploadOptions {
    attachment: {
        cloudFilename: string;
        userLocalFilename: string;
    },
    studentGradeId?: number;
    studentGradeInstanceId?: number;
}

export interface ListAttachmentOptions {
    studentGradeId?: number;
    studentGradeInstanceId?: number;
    studentWorkbookId?: number;
}

export interface ListAttachmentOptions {
    studentGradeId?: number;
    studentGradeInstanceId?: number;
    studentWorkbookId?: number;
}

/* *************** *************** */
/* *********** Editor  *********** */
/* *************** *************** */
export interface ReadQuestionOptions {
    filePath: string;
}

export interface SaveQuestionOptions {
    problemSource: string;
    relativePath: string;
}

export interface CatalogOptions {
}

/* *************** *************** */
/* *********** Grades  *********** */
/* *************** *************** */
export interface GetGradesOptions {
    userId?: number;
    topicId?: number;
    unitId?: number;
    questionId?: number;
    courseId?: number;
    topicTypeFilter?: TOPIC_TYPE_FILTERS;
}

export interface GetQuestionGradeOptions {
    userId: number;
    questionId: number;
    includeWorkbooks?: boolean;
}

export interface QuestionGradeResponse {
    data: StudentGrade;
}

/* *************** *************** */
/* ****** Problem  Browsing ****** */
/* *************** *************** */
export interface GetBrowseProblemsCourseListOptions {
    params: {
        instructorId?: number | 'me';
    }
}

export interface GetBrowseProblemsUnitListOptions {
    params: {
        courseId: number;
    }
}

export interface GetBrowseProblemsTopicListOptions {
    params: {
        unitId: number;
    }
}

export interface GetProblemSearchResultsOptions {
    params: {
        instructorId?: number | 'me';
        courseId?: number;
        unitId?: number;
        topicId?: number;
    }
}
