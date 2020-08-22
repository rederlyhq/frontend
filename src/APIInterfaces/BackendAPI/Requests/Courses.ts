import { CreateCourseOptions } from '../RequestTypes/Courses';
import * as qs from 'querystring';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../BackendAPIError';
import { AxiosResponse } from 'axios';
import { CreateCourseResponse } from '../ResponseTypes/Courses';

export const postCourse = async ({
    useCurriculum = true,
    data
}: CreateCourseOptions): Promise<AxiosResponse<CreateCourseResponse>> => {
    try {
        return await AxiosRequest.post(`/courses?${
            qs.stringify({
                useCurriculum
            })}`, data);    
    } catch (e) {
        throw new BackendAPIError(e);
    }
};
