import { AxiosResponse } from 'axios';
import BackendAPIError from '../../BackendAPI/BackendAPIError';
import { PutUploadWork } from '../RequestTypes/StudentUploadRequests';
import axios from 'axios';

const attachmentsAxios = axios.create({
    timeout: 300000 // 300000 millis = 5 minues
});

export const putUploadWork = ({
    presignedUrl,
    file,
    onUploadProgress,
}: PutUploadWork): Promise<AxiosResponse<any>> => {
    try {
        return attachmentsAxios.put(presignedUrl.toString(), file, {
            headers: {
                'Content-Type': file.type,
            },
            onUploadProgress: onUploadProgress
        });
    } catch (e) {
        // TODO Don't think this should actually be backend api error since it is not coming from the backend thus won't follow basic format
        // I checked and it shouldn't hurt anything it just makes it more difficult to trap appropriate errors
        throw new BackendAPIError(e);
    }
};
