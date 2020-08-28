import { PostForgotPasswordOptions } from '../RequestTypes/UserRequestTypes';
import { PostForgotPasswordResponse } from '../ResponseTypes/UserResponseTypes';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../BackendAPIError';
import url from 'url';

const USER_PATH = '/users/';
const USER_FORGOT_PASSWORD_PATH = url.resolve(
    USER_PATH,
    'forgot-password'
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
