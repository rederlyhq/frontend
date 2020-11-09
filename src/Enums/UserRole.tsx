import Cookies from 'js-cookie';
import { CookieEnum } from './CookieEnum';
import localPreferences from '../Utilities/LocalPreferences';
const { general } = localPreferences;

export enum UserRole {
    STUDENT   = 'STUDENT',
    PROFESSOR = 'PROFESSOR',
    ADMIN     = 'ADMIN'
}

export const unauthorizedRedirect = () => {
    // TODO: Generic redirect to handle clearing cookies.
    general.loginRedirectURL = `${window.location.pathname}${window.location.search}`;
    Cookies.remove(CookieEnum.USERTYPE);
    Cookies.remove(CookieEnum.SESSION);    
    window.location.assign('/');
};

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

export const getUserRole = (): UserRole => {
    const roleFromCookie = Cookies.get(CookieEnum.USERTYPE);
    // eslint-disable-next-line eqeqeq
    if (roleFromCookie == undefined) {
        unauthorizedRedirect();
        // They should already be redirected
        // But if they are not give them the lowest permission
        return UserRole.STUDENT;
    } else {
        general.loginRedirectURL = null;
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

export const getUserId = () => {
    const userId = Cookies.get(CookieEnum.USERID);
    let userIdValue = 0; 

    if (userId === undefined || isNaN(userIdValue = parseInt(userId, 10))) {
        unauthorizedRedirect();
    } else {
        general.loginRedirectURL = null;
    }

    return userIdValue;
};

/**
 * TODO:
 * This should be included in the above however pushing this out on a deadline I don't want to mess with it
 */
export const getUserIdNoRedirect = () => {
    return Cookies.get(CookieEnum.USERID);
};