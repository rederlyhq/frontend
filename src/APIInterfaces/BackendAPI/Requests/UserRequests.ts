import { PostForgotPasswordOptions, PutUpdatePasswordOptions, PutUpdateForgottonPasswordOptions, PostLoginOptions, PostResendVerificationOptions, GetUsersOptions } from '../RequestTypes/UserRequestTypes';
import { PostForgotPasswordResponse, PutUpdatePasswordResponse, PutUpdateForgottonPasswordResponse, PostLoginResponse, PostResendVerificationResponse, GetUserResponse } from '../ResponseTypes/UserResponseTypes';
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
const USER_UPDATE_FORGOTTON_PASSWORD_PATH = url.resolve(
    USER_PATH,
    'update-forgotton-password'
);
const USER_LOGIN_PATH = url.resolve(
    USER_PATH,
    'login'
);
const USER_RESEND_VERIFICATION_PATH = url.resolve(
    USER_PATH,
    'resend-verification'
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
    newPassword,
    oldPassword
}: PutUpdatePasswordOptions): Promise<PutUpdatePasswordResponse> => {
    try {
        return await AxiosRequest.put(
            USER_UPDATE_PASSWORD_PATH,
            {
                newPassword,
                oldPassword            
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const putUpdateForgottonPassword = async ({
    email,
    newPassword,
    forgotPasswordToken,
}: PutUpdateForgottonPasswordOptions): Promise<PutUpdateForgottonPasswordResponse> => {
    try {
        return await AxiosRequest.put(
            USER_UPDATE_FORGOTTON_PASSWORD_PATH,
            {
                email,
                newPassword,
                forgotPasswordToken,
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postLogin = async ({
    email,
    password
}: PostLoginOptions): Promise<PostLoginResponse> => {
    try {
        return await AxiosRequest.post(
            USER_LOGIN_PATH,
            {
                email,
                password
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const postResendVerification = async ({
    email
}: PostResendVerificationOptions): Promise<PostResendVerificationResponse> => {
    try {
        return await AxiosRequest.post(
            USER_RESEND_VERIFICATION_PATH,
            {
                email,
            }
        );
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getUsersForCourse = async ({
    courseId
}: GetUsersOptions): Promise<GetUserResponse> => {
    try {
        return await AxiosRequest.get(USER_PATH, {params: { courseId }});
    } catch (e) {
        throw new BackendAPIError(e);
    }
};
