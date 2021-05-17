import { AxiosResponse } from 'axios';
import BackendAPIError from '../../BackendAPI/BackendAPIError';
import { PutUploadWork } from '../RequestTypes/StudentUploadRequests';
import axios from 'axios';
import AttachmentType from '../../../Enums/AttachmentTypeEnum';
import { GetUploadURLResponse } from '../../BackendAPI/ResponseTypes/CourseResponseTypes';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import { COURSE_ATTACHMENTS_GET_UPLOAD_PATH } from '../../BackendAPI/Requests/CourseRequests';
import mime from 'mime-types';

const attachmentsAxios = axios.create({
    timeout: 300000 // 300000 millis = 5 minutes
});

export const getGenericUploadURL = async ({
    type
}: {
    type?: AttachmentType
}): Promise<AxiosResponse<GetUploadURLResponse>> => {
    try {
        return await AxiosRequest.post(COURSE_ATTACHMENTS_GET_UPLOAD_PATH, undefined, {
            params: {
                cacheBuster: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
                type
            }
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};


export const putUploadWork = ({
    presignedUrl,
    file,
    onUploadProgress,
}: PutUploadWork): Promise<AxiosResponse<any>> => {
    try {
        return attachmentsAxios.put(presignedUrl.toString(), file, {
            headers: {
                'Content-Type': file.type ? file.type : mime.lookup(file.name),
            },
            onUploadProgress: onUploadProgress
        });
    } catch (e) {
        // TODO Don't think this should actually be backend api error since it is not coming from the backend thus won't follow basic format
        // I checked and it shouldn't hurt anything it just makes it more difficult to trap appropriate errors
        throw new BackendAPIError(e);
    }
};
