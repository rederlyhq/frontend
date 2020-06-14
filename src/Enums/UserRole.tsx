import Cookies from 'js-cookie';
import { CookieEnum } from './CookieEnum';

export enum UserRole {
    STUDENT   = 'STUDENT',
    PROFESSOR = 'PROFESSOR',
    ADMIN     = 'ADMIN'
}

export const getUserRoleFromServer = (roleFromServer: number): UserRole => {
    switch (roleFromServer) {
    case 1:
        return UserRole.PROFESSOR;
    case 2:
        return UserRole.ADMIN;
    case 0:
    default:
        return UserRole.STUDENT;
    }
};

export const getUserRole = (roleFromCookie: string | undefined): UserRole => {
    // I want this to be a soft compare, cause that's probably not a Cookie.
    // eslint-disable-next-line eqeqeq
    if (roleFromCookie == undefined) {
        // TODO: Generic redirect to handle clearing cookies.
        window.location.assign('/');
        Cookies.remove(CookieEnum.USERTYPE);
        Cookies.remove(CookieEnum.SESSION);
        throw Error('Cookie is missing. Please return to Login.');
    }

    switch (roleFromCookie.toLocaleUpperCase()) {
    case UserRole.ADMIN:
        return UserRole.ADMIN;
    case UserRole.PROFESSOR:
        return UserRole.PROFESSOR;
    case UserRole.STUDENT:
    default:
        return UserRole.STUDENT;
    }
};