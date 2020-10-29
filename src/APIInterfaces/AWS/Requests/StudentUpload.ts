import { AxiosResponse } from 'axios';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../../BackendAPI/BackendAPIError';
import { PutUploadWork } from '../RequestTypes/StudentUploadRequests';

export const putUploadWork = ({
    presignedUrl,
    file,
    onUploadProgress,
}: PutUploadWork): Promise<AxiosResponse<any>> => {
    try {
        return AxiosRequest.put(presignedUrl.toString(), file, {
            headers: {
                'Content-Type': file.type,
            },
            onUploadProgress: onUploadProgress
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};