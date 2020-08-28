export interface PostForgotPasswordOptions {
    email: string;
}

export interface PutUpdatePasswordOptions {
    newPassword: string;
    email?: string;
    id?: string;
    forgotPasswordToken?: string;
    oldPassword?: string;
}