import { PostForgotPasswordOptions, PutUpdatePasswordOptions } from '../RequestTypes/UserRequestTypes';
import { PostForgotPasswordResponse, PutUpdatePasswordResponse } from '../ResponseTypes/UserResponseTypes';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../BackendAPIError';
import url from 'url';

const USER_PATH = '/users/';
const USER_FORGOT_PASSWORD_PATH = url.resolve(
    USER_PATH,
    'forgot-password'
);
const USER_UPDATE_PASSWORD_PATH = url.resolve(
    USER_PATH,
    'update-password'
);

export const postForgotPassword = async ({
    email
}: PostForgotPasswordOptions): Promise<PostForgotPasswordResponse> => {
    try {
        return await AxiosRequest.post(
            USER_FORGOT_PASSWORD_PATH,
            {
                email
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const putUpdatePassword = async ({
    email,
    newPassword,
    forgotPasswordToken,
    oldPassword
}: PutUpdatePasswordOptions): Promise<PutUpdatePasswordResponse> => {
    try {
        return await AxiosRequest.put(
            USER_UPDATE_PASSWORD_PATH,
            {
                email,
                newPassword,
                forgotPasswordToken,
                oldPassword            
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};
