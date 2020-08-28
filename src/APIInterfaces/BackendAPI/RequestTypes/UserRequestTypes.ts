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
    forgotPasswordToken?: string;
}