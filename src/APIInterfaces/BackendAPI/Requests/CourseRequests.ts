import { CreateCourseOptions, PutCourseUnitOptions, PutCourseTopicOptions, PutCourseTopicQuestionOptions, PostCourseTopicQuestionOptions, PostDefFileOptions, DeleteCourseTopicQuestionOptions, DeleteCourseTopicOptions, DeleteCourseUnitOptions, PostCourseUnitOptions, PostCourseTopicOptions, PutCourseOptions, GetQuestionsOptions, PutQuestionGradeOptions, DeleteEnrollmentOptions, ExtendCourseTopicForUser } from '../RequestTypes/CourseRequestTypes';
import * as qs from 'querystring';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../BackendAPIError';
import Axios, { AxiosResponse } from 'axios';
import { CreateCourseResponse, PutCourseUnitUpdatesResponse, PutCourseTopicUpdatesResponse, PutCourseTopicQuestionUpdatesResponse, CreateQuestionResponse, PostDefFileResponse, PostUnitResponse, PostTopicResponse, PutCourseUpdatesResponse, GetQuestionsResponse, PutQuestionGradeResponse } from '../ResponseTypes/CourseResponseTypes';
import url from 'url';
import { BackendAPIResponse } from '../BackendAPIResponse';

const COURSE_PATH = '/courses/';
const COURSE_UNIT_PATH = url.resolve(COURSE_PATH, 'unit/');
const COURSE_TOPIC_PATH = url.resolve(COURSE_PATH, 'topic/');
const COURSE_TOPIC_EXTEND_PATH = url.resolve(COURSE_TOPIC_PATH, 'extend/');
const COURSE_QUESTION_PATH = url.resolve(COURSE_PATH, 'question/');
const COURSE_QUESTION_GRADE_PATH = url.resolve(COURSE_QUESTION_PATH, 'grade/');
const COURSE_QUESTIONS_PATH = url.resolve(COURSE_PATH, 'questions/');
const COURSE_DEF_PATH = url.resolve(COURSE_PATH, 'def/');
const COURSE_ENROLL_PATH = url.resolve(COURSE_PATH, 'enroll/');

/* *************** *************** */
/* *********** Courses *********** */
/* *************** *************** */
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
    courseTopicContentId, userId,
    extensions
}: ExtendCourseTopicForUser): Promise<AxiosResponse<BackendAPIResponse>> => {
    try {
        return await AxiosRequest.post(
            url.resolve(
                COURSE_TOPIC_EXTEND_PATH,
                `courseTopicContentId=${courseTopicContentId}&userId=${userId}`
            ), extensions
        )
    } catch (e) {
        throw new BackendAPIError(e);
    }
}

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
    acceptedFiles
}: PostDefFileOptions): Promise<AxiosResponse<PostDefFileResponse>> => {
    const data = new FormData();
    data.append('def-file', acceptedFiles[0]);

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
                }
            }
        );
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
}