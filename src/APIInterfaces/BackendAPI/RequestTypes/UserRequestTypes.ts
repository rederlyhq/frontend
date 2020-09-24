export interface PostForgotPasswordOptions {
    email: string;
}

export interface PutUpdatePasswordOptions {
    newPassword: string;
    oldPassword: string;
}

export interface PutUpdateForgottonPasswordOptions {
    newPassword: string;
    email: string;
    forgotPasswordToken: string;
}

export interface PostLoginOptions {
    email: string;
    password: string;
}

export interface PostResendVerificationOptions {
    email: string;
}

export interface GetUsersOptions {
    courseId: number;
}