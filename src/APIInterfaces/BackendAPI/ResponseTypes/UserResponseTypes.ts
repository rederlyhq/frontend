import { BackendAPIResponse } from '../BackendAPIResponse';
import { AxiosResponse } from 'axios';

type PostForgotPassword = any;
export type PostForgotPasswordResponse = BackendAPIResponse<PostForgotPassword>;

type PutUpdatePassword = any;
export type PutUpdatePasswordResponse = BackendAPIResponse<PutUpdatePassword>;

type PutUpdateForgottonPassword = any;
export type PutUpdateForgottonPasswordResponse = BackendAPIResponse<PutUpdateForgottonPassword>;

type PostLogin = any;
export type PostLoginResponse = AxiosResponse<PostLogin>;

type PostResendVerification = any;
export type PostResendVerificationResponse = AxiosResponse<PostResendVerification>;

type GetUser = any;
export type GetUserResponse = AxiosResponse<GetUser>;

type RegisterUser = {
    verificationBypass: boolean;
};
export type RegisterUserResponse = AxiosResponse<BackendAPIResponse<RegisterUser>>;

type GetVerification = unknown;
export type GetVerificationResponse = AxiosResponse<BackendAPIResponse<GetVerification>>;

export type GetJWTResponse = AxiosResponse<BackendAPIResponse<string>>;
