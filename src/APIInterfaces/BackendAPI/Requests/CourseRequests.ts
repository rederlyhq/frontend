import { CreateCourseOptions, PutCourseUnitOptions, PutCourseTopicOptions, PutCourseTopicQuestionOptions } from '../RequestTypes/CourseRequestTypes';
import * as qs from 'querystring';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../BackendAPIError';
import { AxiosResponse } from 'axios';
import { CreateCourseResponse, PutCourseUnitUpdatesResponse, PutCourseTopicUpdatesResponse, PutCourseTopicQuestionUpdatesResponse } from '../ResponseTypes/CourseResponseTypes';
import url from 'url';

const COURSE_PATH = '/courses/';
const COURSE_UNIT_PATH = url.resolve(COURSE_PATH, 'unit/');
const COURSE_TOPIC_PATH = url.resolve(COURSE_PATH, 'topic/');
const COURSE_QUESTION_PATH = url.resolve(COURSE_PATH, 'question/');

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
            ), data);    
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
            data);    
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
            data);    
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
            data);    
    } catch (e) {
        throw new BackendAPIError(e);
    }
};