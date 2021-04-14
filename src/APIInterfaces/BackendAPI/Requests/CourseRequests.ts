import { CreateCourseOptions, PutCourseUnitOptions, PutCourseTopicOptions, PutCourseTopicQuestionOptions, PostCourseTopicQuestionOptions, PostDefFileOptions, DeleteCourseTopicQuestionOptions, DeleteCourseTopicOptions, DeleteCourseUnitOptions, PostCourseUnitOptions, PostCourseTopicOptions, PutCourseOptions, GetQuestionsOptions, PutQuestionGradeOptions, DeleteEnrollmentOptions, PostQuestionSubmissionOptions, ExtendCourseTopicForUser, GetCourseTopicOptions, GetQuestionOptions, ExtendCourseTopicQuestionsForUser, GenerateNewVersionOptions, SubmitVersionOptions, PutQuestionGradeInstanceOptions, EndVersionOptions, PreviewQuestionOptions, getAssessmentProblemsWithWorkbooksOptions, PostConfirmAttachmentUploadOptions, PostEmailProfOptions, ListAttachmentOptions, ReadQuestionOptions, SaveQuestionOptions, GetGradesOptions, EnrollByCodeOptions, GetRawQuestionOptions, QuestionGradeResponse, GetQuestionGradeOptions, AskForHelpOptions, PostImportCourseArchiveOptions, ShowMeAnotherOptions, GetBrowseProblemsCourseListOptions, GetBrowseProblemsUnitListOptions, GetBrowseProblemsTopicListOptions, GetProblemSearchResultsOptions, EnrollStudentOptions, PostFeedbackOptions, PostGenericConfirmAttachmentUploadOptions, PostTopicFeedbackOptions, GetTopicFeedbackOptions } from '../RequestTypes/CourseRequestTypes';
import * as qs from 'querystring';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../BackendAPIError';
import { AxiosResponse } from 'axios';
import { CreateCourseResponse, PutCourseUnitUpdatesResponse, PutCourseTopicUpdatesResponse, PutCourseTopicQuestionUpdatesResponse, CreateQuestionResponse, PostDefFileResponse, PostUnitResponse, PostTopicResponse, PutCourseUpdatesResponse, GetQuestionsResponse, PutQuestionGradeResponse, PostQuestionSubmissionResponse, GetTopicResponse, GetQuestionResponse, PutQuestionGradeInstanceResponse, GetUploadURLResponse, PostEmailProfResponse, ListAttachmentsResponse, ReadQuestionResponse, SaveQuestionResponse, CatalogResponse, GradesResponse, EnrollByCodeResponse, PostImportCourseArchiveResponse, GetBrowseProblemsUnitListResponse, GetBrowseProblemsTopicListResponse, GetBrowseProblemsCourseListResponse, GetProblemSearchResultsResponse, EnrollManuallyResponse, GetTopicGradesForCourseResponse, GetAllVersionDataResponse } from '../ResponseTypes/CourseResponseTypes';
import url from 'url';
import { BackendAPIResponse } from '../BackendAPIResponse';
import _ from 'lodash';
import { StudentTopicAssessmentFields } from '../../../Courses/CourseInterfaces';
import AttachmentType from '../../../Enums/AttachmentTypeEnum';
// This module can only be referenced with ECMAScript imports/exports by turning on the 'allowSyntheticDefaultImports' flag and referencing its default export.
const urlJoin: (...args: string[]) => string = require('url-join');

const COURSE_PATH = '/courses/';
const COURSE_ID = (courseId: number): string => urlJoin(COURSE_PATH, courseId.toString());
const COURSE_IMPORT_ARCHIVE = (courseId: number): string => urlJoin(COURSE_ID(courseId), '/import-archive/');
const COURSE_TOPIC_GRADES = (courseId: number): string => urlJoin(COURSE_ID(courseId), '/topic-grades/');
const COURSE_UNIT_PATH = url.resolve(COURSE_PATH, 'unit/');
const COURSE_TOPIC_PATH = url.resolve(COURSE_PATH, 'topic/');
const COURSE_QUESTION_PATH = url.resolve(COURSE_PATH, 'question/');
const COURSE_QUESTION_GRADE_PATH = url.resolve(COURSE_QUESTION_PATH, 'grade/');
const COURSE_QUESTION_INSTANCE_PATH = url.resolve(COURSE_QUESTION_GRADE_PATH, 'instance/');
const COURSE_QUESTIONS_PATH = url.resolve(COURSE_PATH, 'questions/');
const COURSE_DEF_PATH = url.resolve(COURSE_PATH, 'def/');
const COURSE_ENROLL_PATH = url.resolve(COURSE_PATH, 'enroll/');
const COURSE_ASSESS_PATH = url.resolve(COURSE_PATH, 'assessment/');
const COURSE_ATTACHMENTS_PATH = url.resolve(COURSE_PATH, 'attachments/');
export const COURSE_ATTACHMENTS_GET_UPLOAD_PATH = url.resolve(COURSE_ATTACHMENTS_PATH, 'upload-url/');
const COURSE_ATTACHMENTS_LIST_PATH = url.resolve(COURSE_ATTACHMENTS_PATH, 'list/');
const COURSE_PROBLEM_EDITOR = url.resolve(COURSE_PATH, 'question/editor/');
const COURSE_PROBLEM_EDITOR_READ = url.resolve(COURSE_PROBLEM_EDITOR, 'read/');
const COURSE_PROBLEM_EDITOR_SAVE = url.resolve(COURSE_PROBLEM_EDITOR, 'save/');
const COURSE_PROBLEM_EDITOR_UPLOAD_ASSET = url.resolve(COURSE_PROBLEM_EDITOR, 'upload-asset/');
const COURSE_PROBLEM_EDITOR_CATALOG = url.resolve(COURSE_PROBLEM_EDITOR, 'catalog/');
const COURSE_GRADES_PATH = url.resolve(COURSE_PATH, 'grades/');
const COURSE_BROWSE_PROBLEMS = urlJoin(COURSE_PATH, 'browse-problems/');
const COURSE_BROWSE_PROBLEMS_COURSES = urlJoin(COURSE_BROWSE_PROBLEMS, 'course-list/');
const COURSE_BROWSE_PROBLEMS_UNITS = urlJoin(COURSE_BROWSE_PROBLEMS, 'unit-list/');
const COURSE_BROWSE_PROBLEMS_TOPICS = urlJoin(COURSE_BROWSE_PROBLEMS, 'topic-list/');
const COURSE_BROWSE_PROBLEMS_SEARCH = urlJoin(COURSE_BROWSE_PROBLEMS, 'search/');
const COURSE_WORKBOOK_PATH = urlJoin(COURSE_PATH, 'workbook');
const COURSE_UPLOAD_PATH = urlJoin(COURSE_PATH, 'upload/');
const COURSE_UPLOAD_WORKBOOK_FEEDBACK_PATH = (workbookId: string | number) => urlJoin(COURSE_UPLOAD_PATH, 'workbook/', workbookId.toString(), '/feedback');
const COURSE_UPLOAD_TOPIC_FEEDBACK_PATH = (topicId: string | number) => urlJoin(COURSE_UPLOAD_PATH, 'topic/', topicId.toString(), '/feedback');
const COURSE_UPLOAD_TOPIC_DESCRIPTION_PATH = (topicId: string | number) => urlJoin(COURSE_UPLOAD_PATH, 'topic/', topicId.toString(), '/description');
const COURSE_TOPIC_FEEDBACK_PATH = (topicId: string | number, userId: string | number) => urlJoin(COURSE_PATH, 'feedback/topic/', topicId.toString(), 'user', userId.toString());

/* *************** *************** */
/* *********** Courses *********** */
/* *************** *************** */
export const getCourse = async ({
    courseId
}: {
    courseId: number;
}): Promise<AxiosResponse<CreateCourseResponse>> => {
    try {
        return await AxiosRequest.get(COURSE_ID(courseId));
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postCourse = async ({
    useCurriculum = true,
    data
}: CreateCourseOptions): Promise<AxiosResponse<CreateCourseResponse>> => {
    try {
        return await AxiosRequest.post(
            url.resolve(
                COURSE_PATH,
                `?${qs.stringify({
                    useCurriculum
                })}`
            ), data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postImportCourseArchive = async ({
    archiveFile,
    courseId,
    keepBucketsAsTopics
}: PostImportCourseArchiveOptions): Promise<AxiosResponse<PostImportCourseArchiveResponse>> => {
    const data = new FormData();
    data.append('file', archiveFile);

    try {
        return await AxiosRequest.post(
            COURSE_IMPORT_ARCHIVE(courseId),
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                params: {
                    keepBucketsAsTopics: keepBucketsAsTopics
                }
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const putCourse = async ({
    id,
    data
}: PutCourseOptions): Promise<AxiosResponse<PutCourseUpdatesResponse>> => {
    try {
        return await AxiosRequest.put(
            url.resolve(
                COURSE_PATH,
                `${id}/`
            ),
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postEmailProfessor = async ({
    courseId,
    content,
    question
}: PostEmailProfOptions): Promise<AxiosResponse<PostEmailProfResponse>> => {
    return await AxiosRequest.post(
        url.resolve(
            COURSE_PATH,
            `${courseId}/email`
        ),
        {content, question}
    );
};

/* *************** *************** */
/* ************ Units ************ */
/* *************** *************** */
export const postUnit = async ({
    data
}: PostCourseUnitOptions): Promise<AxiosResponse<PostUnitResponse>> => {
    try {
        return await AxiosRequest.post(
            COURSE_UNIT_PATH,
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const putUnit = async ({
    id,
    data
}: PutCourseUnitOptions): Promise<AxiosResponse<PutCourseUnitUpdatesResponse>> => {
    try {
        return await AxiosRequest.put(
            url.resolve(
                COURSE_UNIT_PATH,
                `${id}/`
            ),
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const deleteUnit = async ({
    id
}: DeleteCourseUnitOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.delete(
            url.resolve(
                COURSE_UNIT_PATH,
                `${id}/`
            )
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

/* *************** *************** */
/* *********** Topics  *********** */
/* *************** *************** */
export const getTopic = async ({
    id,
    userId,
    includeQuestions
}: GetCourseTopicOptions): Promise<AxiosResponse<GetTopicResponse>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(COURSE_TOPIC_PATH, `${id}?${qs.stringify(_.omitBy({
                userId,
                includeQuestions
            }, _.isUndefined))}`)
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postTopic = async ({
    data
}: PostCourseTopicOptions): Promise<AxiosResponse<PostTopicResponse>> => {
    try {
        return await AxiosRequest.post(
            COURSE_TOPIC_PATH,
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const putTopic = async ({
    id,
    data
}: PutCourseTopicOptions): Promise<AxiosResponse<PutCourseTopicUpdatesResponse>> => {
    try {
        return await AxiosRequest.put(
            url.resolve(
                COURSE_TOPIC_PATH,
                `${id}/`
            ),
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const deleteTopic = async ({
    id
}: DeleteCourseTopicOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.delete(
            url.resolve(
                COURSE_TOPIC_PATH,
                `${id}/`
            )
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const extendTopic = async ({
    courseTopicContentId,
    userId,
    topicAssessmentInfoId,
    data,
}: ExtendCourseTopicForUser): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.put(
            url.resolve(
                COURSE_TOPIC_PATH,
                `extend?${qs.stringify(
                    _.omitBy({
                        courseTopicContentId,
                        userId,
                        topicAssessmentInfoId
                    }, _.isUndefined))
                }`
            ), data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getTopicFeedback = async ({
    topicId, userId
}: GetTopicFeedbackOptions): Promise<BackendAPIResponse<any>> => {
    try {
        return await AxiosRequest.get(
            COURSE_TOPIC_FEEDBACK_PATH(topicId, userId)
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postTopicFeedback = async ({
    topicId, userId, content
}: PostTopicFeedbackOptions): Promise<BackendAPIResponse<any>> => {
    try {
        return await AxiosRequest.post(
            COURSE_TOPIC_FEEDBACK_PATH(topicId, userId),
            {
                content
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

/* *************** *************** */
/* ********** Questions ********** */
/* *************** *************** */
export const postQuestion = async ({
    data
}: PostCourseTopicQuestionOptions): Promise<AxiosResponse<CreateQuestionResponse>> => {
    try {
        return await AxiosRequest.post(
            COURSE_QUESTION_PATH,
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postQuestionSubmission = async ({
    id,
    data
}: PostQuestionSubmissionOptions): Promise<AxiosResponse<PostQuestionSubmissionResponse>> => {
    try {
        return await AxiosRequest.post(
            url.resolve(
                COURSE_QUESTION_PATH,
                `${id}/`
            ),
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const putQuestion = async ({
    id,
    data
}: PutCourseTopicQuestionOptions): Promise<AxiosResponse<PutCourseTopicQuestionUpdatesResponse>> => {
    try {
        return await AxiosRequest.put(
            url.resolve(
                COURSE_QUESTION_PATH,
                `${id}/`
            ),
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const putQuestionGrade = async ({
    id,
    data
}: PutQuestionGradeOptions): Promise<AxiosResponse<PutQuestionGradeResponse>> => {
    try {
        return await AxiosRequest.put(
            url.resolve(
                COURSE_QUESTION_GRADE_PATH,
                `${id}/`
            ),
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const putQuestionGradeInstance = async ({
    id,
    data
}: PutQuestionGradeInstanceOptions): Promise<AxiosResponse<PutQuestionGradeInstanceResponse>> => {
    try {
        return await AxiosRequest.put(
            url.resolve(
                COURSE_QUESTION_INSTANCE_PATH,
                `${id}/`
            ),
            data
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const deleteQuestion = async ({
    id
}: DeleteCourseTopicQuestionOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.delete(
            url.resolve(
                COURSE_QUESTION_PATH,
                `${id}/`
            )
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postDefFile = async ({
    courseTopicId,
    defFile,
}: PostDefFileOptions): Promise<AxiosResponse<PostDefFileResponse>> => {
    const data = new FormData();
    data.append('def-file', defFile);

    try {
        return await AxiosRequest.post(
            url.resolve(
                COURSE_DEF_PATH,
                `?${qs.stringify({
                    courseTopicId,
                })}`
            ),
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

// This handles both GET and SUBMIT.
export const postPreviewQuestion = async ({
    webworkQuestionPath,
    problemSeed,
    formData,
    problemSource,
    showHints,
    showSolutions
}: PreviewQuestionOptions): Promise<AxiosResponse<GetQuestionResponse>> => {
    if (_.isNil(problemSource) && _.isNil(webworkQuestionPath)) {
        throw new Error('Problem source or webwork question path must be defined');
    }

    if (!_.isNil(problemSource)) {
        formData = formData ?? new FormData();
        formData.set('problemSource', Buffer.from(problemSource).toString('base64'));
        !_.isNil(showHints) && formData.set('showHints', showHints.toString());
        !_.isNil(showSolutions) && formData.set('showSolutions', showSolutions.toString());
    }

    // TODO remove, problem seed shouldn't be here anyway so this is temporary
    formData?.delete('problemSeed');
    if (!_.isNil(webworkQuestionPath) && !_.isNil(formData)) {
        formData.set('sourceFilePath', webworkQuestionPath);
    }

    try {
        return await AxiosRequest.post(
            url.resolve(COURSE_PATH, 'preview'), formData, {
                params: {
                    webworkQuestionPath,
                    problemSeed,
                    showAnswersUpfront: showSolutions,
                }
            });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getRawQuestion = async ({
    id,
    userId,
}: GetRawQuestionOptions): Promise<AxiosResponse<GetQuestionResponse>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(COURSE_QUESTION_PATH, `${id}/raw`), {
                params: {
                    userId,
                }
            });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getQuestion = async ({
    id,
    userId,
    readonly,
    workbookId,
    studentTopicAssessmentInfoId,
    showCorrectAnswers,
}: GetQuestionOptions): Promise<AxiosResponse<GetQuestionResponse>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(COURSE_QUESTION_PATH, `${id}`), {
                params: {
                    userId,
                    readonly,
                    workbookId,
                    studentTopicAssessmentInfoId,
                    showCorrectAnswers,
                }
            });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getQuestions = async ({
    userId,
    courseTopicContentId
}: GetQuestionsOptions): Promise<AxiosResponse<GetQuestionsResponse>> => {
    try {
        return await AxiosRequest.get(COURSE_QUESTIONS_PATH, {
            params: {
                userId,
                courseTopicContentId
            }
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const extendQuestion = async ({
    courseTopicQuestionId,
    userId,
    extensions
}: ExtendCourseTopicQuestionsForUser): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.put(
            url.resolve(COURSE_QUESTION_PATH, `extend?${qs.stringify({courseTopicQuestionId, userId})}`),
            extensions
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const enrollByCode = async({
    enrollCode
}: EnrollByCodeOptions): Promise<AxiosResponse<EnrollByCodeResponse>> => {
    try {
        return await AxiosRequest.post(
            url.resolve(
                COURSE_ENROLL_PATH,
                enrollCode
            ),
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const enrollStudent = async({
    studentEmail,
    courseId
}: EnrollStudentOptions): Promise<AxiosResponse<EnrollManuallyResponse>> => {
    try {
        return await AxiosRequest.post(
            COURSE_ENROLL_PATH,
            {
                studentEmail: studentEmail,
                courseId: courseId
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const deleteEnrollment = async ({
    userId, courseId
}: DeleteEnrollmentOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.delete(
            COURSE_ENROLL_PATH,
            {
                data: {
                    userId, courseId
                }
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const generateNewVersion = async ({
    topicId
}: GenerateNewVersionOptions): Promise<AxiosResponse<BackendAPIResponse<StudentTopicAssessmentFields>>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(COURSE_ASSESS_PATH, `topic/${topicId}/start`),
            {
                headers: {
                    /**
                     * Forms send this field in the origin header, however that wasn't coming across with the axios request
                     * Adding `origin` myself was getting stripped
                     * Could not find solution online so used a custom header
                     * Other headers don't work because they get modified by aws (between cloudfront and the load balancers)
                     */
                    'rederly-origin': window.location.origin,
                }
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const submitVersion = async ({
    topicId,
    versionId
}: SubmitVersionOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.post(
            url.resolve(COURSE_ASSESS_PATH, `topic/${topicId}/submit/${versionId}`)
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const endVersion = async ({
    versionId
}: EndVersionOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(COURSE_ASSESS_PATH, `topic/end/${versionId}`)
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getAssessmentProblemsWithWorkbooks = async ({
    topicId
}: getAssessmentProblemsWithWorkbooksOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(COURSE_ASSESS_PATH, `topic/grade/${topicId}`)
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const askForHelp = async ({
    questionId
}: AskForHelpOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(COURSE_QUESTION_PATH, `${questionId}/openlab`),
            {
                headers: {
                    /**
                     * Forms send this field in the origin header, however that wasn't coming across with the axios request
                     * Adding `origin` myself was getting stripped
                     * Could not find solution online so used a custom header
                     * Other headers don't work because they get modified by aws (between cloudfront and the load balancers)
                     */
                    'rederly-origin': window.location.origin,
                }
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const requestNewProblemVersion = async ({
    questionId
}: ShowMeAnotherOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(COURSE_QUESTION_PATH, `${questionId}/sma`)
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postFeedback = async ({
    workbookId,
    content
}: PostFeedbackOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.post(
            urlJoin(COURSE_WORKBOOK_PATH, `${workbookId}/feedback`), {
                content
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};


/* *************** *************** */
/* ********** Attachments ********** */
/* *************** *************** */

export const getUploadURL = async (): Promise<AxiosResponse<GetUploadURLResponse>> => {
    try {
        return await AxiosRequest.post(COURSE_ATTACHMENTS_GET_UPLOAD_PATH, undefined, {
            params: {
                cacheBuster: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
            }
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postConfirmAttachmentUpload = async (options: PostConfirmAttachmentUploadOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.post(COURSE_ATTACHMENTS_PATH, options);
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postGenericConfirmAttachmentUpload = async (options: PostGenericConfirmAttachmentUploadOptions): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        switch (options.type) {
        case AttachmentType.WORKBOOK_FEEDBACK:
            return await AxiosRequest.post(COURSE_UPLOAD_WORKBOOK_FEEDBACK_PATH(options.workbookId), {
                attachment: options.attachment,
            });
        case AttachmentType.TOPIC_FEEDBACK:
            return await AxiosRequest.post(COURSE_UPLOAD_TOPIC_FEEDBACK_PATH(options.topicId), {
                attachment: options.attachment,
                studentId: options.userId,
            });
        case AttachmentType.TOPIC_DESCRIPTION:
            return await AxiosRequest.post(COURSE_UPLOAD_TOPIC_DESCRIPTION_PATH(options.topicId), {
                attachment: options.attachment,
            });
        default:
            throw new Error(`The option ${options} is not supported by this call.`);
        }
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

// Workbooks is an auditing field and there isn't a practical frontend use for them right now.
export const getAttachments = async ({
    studentGradeId,
    studentGradeInstanceId,
    studentWorkbookId,
}: ListAttachmentOptions): Promise<AxiosResponse<ListAttachmentsResponse>> => {
    try {
        const gradeParams = {
            ...(studentGradeInstanceId ?
                {studentGradeInstanceId: studentGradeInstanceId} :
                {studentGradeId: studentGradeId}
            ),
        };
        const params = studentWorkbookId ? { studentWorkbookId } : gradeParams;

        return await AxiosRequest.get(COURSE_ATTACHMENTS_LIST_PATH, {
            params,
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const readProblem = async ({
    filePath
}: ReadQuestionOptions): Promise<AxiosResponse<ReadQuestionResponse>> => {
    try {
        return await AxiosRequest.post(COURSE_PROBLEM_EDITOR_READ, {
            filePath: filePath
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const saveProblem = async ({
    problemSource,
    relativePath,
}: SaveQuestionOptions): Promise<AxiosResponse<SaveQuestionResponse>> => {
    try {
        return await AxiosRequest.post(COURSE_PROBLEM_EDITOR_SAVE, {
            problemSource: problemSource,
            relativePath: relativePath,
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const uploadAsset = async ({
    file,
    relativePath,
}: {
    file: File;
    relativePath: string;
}): Promise<AxiosResponse<SaveQuestionResponse>> => {
    const data = new FormData();
    data.append('relativePath', relativePath);
    data.append('asset-file', file);

    try {
        return await AxiosRequest.post(
            COURSE_PROBLEM_EDITOR_UPLOAD_ASSET,
            data,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const catalog = async (): Promise<AxiosResponse<CatalogResponse>> => {
    try {
        return await AxiosRequest.post(COURSE_PROBLEM_EDITOR_CATALOG);
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const deleteAttachments = async ({
    id
}: {id: number}): Promise<AxiosResponse<any>> => {
    try {
        return await AxiosRequest.delete(url.resolve(COURSE_ATTACHMENTS_PATH, `${id}/`));
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const startExportOfTopic = async ({
    topicId,
    force = false,
    showSolutions = false,
}: {topicId: number; force: boolean; showSolutions: boolean}): Promise<AxiosResponse<any>> => {
    try {
        return await AxiosRequest.post(urlJoin(COURSE_TOPIC_PATH, `${topicId}/startExport`), {}, {
            params: {
                force,
                showSolutions
            }
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getAllContentForVersion = async ({
    userId,
    topicId
}: {userId: number, topicId: number}): Promise<AxiosResponse<GetAllVersionDataResponse>> => {
    try {
        return await AxiosRequest.get(url.resolve(COURSE_TOPIC_PATH, `${topicId}/version/${userId}`));
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getGrades = async ({
    userId,
    questionId,
    topicId,
    unitId,
    courseId,
}: GetGradesOptions): Promise<AxiosResponse<GradesResponse>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(
                COURSE_GRADES_PATH,
                `?${qs.stringify(_.omitBy({
                    userId: userId,
                    questionId: questionId,
                    topicId: topicId,
                    unitId: unitId,
                    courseId: courseId,
                }, _.isUndefined))}`
            ));
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getQuestionGrade = async ({
    userId,
    questionId,
    includeWorkbooks,
}: GetQuestionGradeOptions): Promise<AxiosResponse<QuestionGradeResponse>> => {
    try {
        return await AxiosRequest.get(
            url.resolve(
                COURSE_QUESTION_PATH,
                `${questionId}/grade?${qs.stringify(_.omitBy({
                    userId,
                    includeWorkbooks,
                }, _.isUndefined))}`
            ));
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

/* *************** *************** */
/* ****** Problem  Browsing ****** */
/* *************** *************** */

export const getBrowseProblemsCourseList = async ({
    params: {
        instructorId = 'me'
    }
}: GetBrowseProblemsCourseListOptions): Promise<AxiosResponse<GetBrowseProblemsCourseListResponse>> => {
    try {
        return await AxiosRequest.get(COURSE_BROWSE_PROBLEMS_COURSES, {
            params: {
                instructorId: instructorId,
                
            }
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getBrowseProblemsUnitList = async ({
    params: {
        courseId
    }
}: GetBrowseProblemsUnitListOptions): Promise<AxiosResponse<GetBrowseProblemsUnitListResponse>> => {
    try {
        return await AxiosRequest.get(COURSE_BROWSE_PROBLEMS_UNITS, {
            params: {
                courseId: courseId,
            }
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getBrowseProblemsTopicList = async ({
    params: {
        unitId
    }
}: GetBrowseProblemsTopicListOptions): Promise<AxiosResponse<GetBrowseProblemsTopicListResponse>> => {
    try {
        return await AxiosRequest.get(COURSE_BROWSE_PROBLEMS_TOPICS, {
            params: {
                unitId: unitId,
            }
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getProblemSearchResults = async ({
    params: {
        unitId,
        courseId,
        topicId,
        instructorId = 'me'
    }
}: GetProblemSearchResultsOptions): Promise<AxiosResponse<GetProblemSearchResultsResponse>> => {
    try {
        return await AxiosRequest.get(COURSE_BROWSE_PROBLEMS_SEARCH, {
            params: _.omitBy({
                unitId: unitId,
                courseId: courseId,
                topicId: topicId,
                instructorId: instructorId,
            }, _.isUndefined)
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getTopicGradesForCourse = async ({
    courseId
}: {
    courseId: number;
}): Promise<AxiosResponse<GetTopicGradesForCourseResponse>> => {
    try {
        return await AxiosRequest.get(COURSE_TOPIC_GRADES(courseId));
    } catch (e) {
        throw new BackendAPIError(e);
    }
};
