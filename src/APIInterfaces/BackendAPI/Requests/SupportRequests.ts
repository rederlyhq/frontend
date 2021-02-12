import { AxiosResponse } from 'axios';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../BackendAPIError';

export const createSupportTicket = async ({
    description,
    summary,
    url,
    version,
    userAgent,
}: {
    description: string;
    summary: string;
    url: string;
    version: string;
    userAgent: string;
}): Promise<AxiosResponse<unknown>> => {
    try {
        return await AxiosRequest.post('/support', {
            description: description,
            summary: summary,
            url: url,
            version: version,
            userAgent: userAgent,
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};