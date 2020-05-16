export enum UserRole {
    STUDENT   = 'STUDENT',
    PROFESSOR = 'PROFESSOR',
}

export const getUserRole = (roleFromCookie: string | undefined): UserRole => {
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