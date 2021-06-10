import { AxiosResponse } from 'axios';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../BackendAPIError';
import { UniversityCreationType } from '../RequestTypes/UniversityRequestTypes';

export const createUniversity = async ({
    name,
    professorDomain,
    studentDomain,
    autoVerify,
    paidUntil,
}: UniversityCreationType): Promise<AxiosResponse<unknown>> => {
    try {
        return await AxiosRequest.post('/universities', {    
            universityName: name,
            profEmailDomain: professorDomain,
            studentEmailDomain: studentDomain,
            verifyInstitutionalEmail: !autoVerify,
            paidUntil,
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};