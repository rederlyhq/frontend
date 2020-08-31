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
