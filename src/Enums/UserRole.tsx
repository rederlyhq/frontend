export enum UserRole {
    STUDENT   = 'STUDENT',
    PROFESSOR = 'PROFESSOR',
}

export const getUserRole = (roleFromCookie: string | undefined): UserRole => {
    // I want this to be a soft compare, cause that's probably not a Cookie.
    // eslint-disable-next-line eqeqeq
    if (roleFromCookie == undefined) {
        window.location.assign('/');
        throw Error('Cookie is missing. Please return to Login.');
    }

    switch (roleFromCookie.toLocaleUpperCase()) {
    case UserRole.PROFESSOR:
        return UserRole.PROFESSOR;
    case UserRole.STUDENT:
    default:
        return UserRole.STUDENT;
    }
};