import { PostForgotPasswordOptions, PutUpdatePasswordOptions, PutUpdateForgottonPasswordOptions, PostLoginOptions, PostResendVerificationOptions, GetUsersOptions, RegisterUserOptions, GetVerificationOptions } from '../RequestTypes/UserRequestTypes';
import { PostForgotPasswordResponse, PutUpdatePasswordResponse, PutUpdateForgottonPasswordResponse, PostLoginResponse, PostResendVerificationResponse, GetUserResponse, RegisterUserResponse, GetVerificationResponse } from '../ResponseTypes/UserResponseTypes';
import AxiosRequest from '../../../Hooks/AxiosRequest';
import BackendAPIError from '../BackendAPIError';
import url from 'url';
import * as qs from 'querystring';
import { BackendAPIResponse } from '../BackendAPIResponse';
// This module can only be referenced with ECMAScript imports/exports by turning on the 'allowSyntheticDefaultImports' flag and referencing its default export.
const urlJoin: (...args: string[]) => string = require('url-join');

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
const USER_VERIFICATION_PATH = url.resolve(
    USER_PATH,
    'verify'
);
const USER_REGISTER_PATH = url.resolve(
    USER_PATH,
    'register'
);
const USER_CHECK_IN_PATH = url.resolve(
    USER_PATH,
    'check-in'
);

const USER_LOGOUT_PATH = url.resolve(
    USER_PATH,
    'logout'
);

const USER_IMPERSONATE_PATH = urlJoin(
    USER_PATH,
    'impersonate'
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

export const getVerification = async ({
    verifyToken,
    confirmEmail,
}: GetVerificationOptions): Promise<GetVerificationResponse> => {
    try {
        return await AxiosRequest.get(
            url.resolve(
                USER_VERIFICATION_PATH,
                `?${qs.stringify({
                    verifyToken: verifyToken,
                    confirmEmail: confirmEmail,
                })}`
            ));
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

export const registerUser = async (data: RegisterUserOptions): Promise<RegisterUserResponse> => {
    try {
        return await AxiosRequest.post(USER_REGISTER_PATH, data);
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const checkIn = async (): Promise<BackendAPIResponse> => {
    try {
        // Route can be called with any verb
        return await AxiosRequest.get(USER_CHECK_IN_PATH);
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const logout = async (): Promise<BackendAPIResponse> => {
    try {
        return await AxiosRequest.post(USER_LOGOUT_PATH);
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const impersonate = async ({
    role
}: {
    role: string | null;
}): Promise<BackendAPIResponse> => {
    try {
        return await AxiosRequest.post(USER_IMPERSONATE_PATH, {
            role: role
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};
