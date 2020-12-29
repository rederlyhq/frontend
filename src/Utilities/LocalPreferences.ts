import _ from 'lodash';

const STUDENT_TOPIC_PREFERENCES_USE_SECONDS = 'STUDENT_TOPIC_PREFERENCES_USE_SECONDS';
const LOGGING_LEVEL = 'LOGGING_LEVEL';
const VERSION_CHECK_DATE = 'VERSION_CHECK_DATE';
const GENERAL_LOGIN_REDIRECT_URL = 'GENERAL_LOGIN_REDIRECT_URL'; 
const SESSION_USER_TYPE = 'SESSION_USER_TYPE'; 
const SESSION_USER_ID = 'SESSION_USER_ID'; 
const SESSION_USER_UUID = 'SESSION_USER_UUID'; 
const SESSION_USER_USERNAME = 'SESSION_USER_USERNAME'; 
const ACCOUNT_PAID_UNTIL = 'ACCOUNT_PAID_UNTIL';
const ACCOUNT_OWNER = 'ACCOUNT_OWNER';
const ACCOUNT_STATUS = 'ACCOUNT_STATUS';

export enum AccountType {
    INDIVIDUAL = 'INDIVIDUAL',
    INSTITUTIONAL = 'INSTITUTIONAL',
    DISABLED = 'DISABLED',
}

export enum AccountStatus {
    VALID = 'VALID',
    EXPIRED = 'EXPIRED',
}

const getItemWithDefaultValue = (key: string, defaultValue?: string) => {
    const value = localStorage.getItem(key);
    if (_.isNil(value)) {
        if(_.isUndefined(defaultValue)) {
            return value;
        } else {
            return defaultValue;
        }
    } else {
        return value;
    }
};

const setItem = (key: string, value: string | null) => {
    if (_.isNull(value)) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, value);
    }
};

const setBooleanValue = (key: string, value: boolean) => {
    localStorage.setItem(key, value.toString());
};

const setDateValue = (key: string, value: Date | null) => {
    if (_.isNull(value)) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, value.toString());
    }
};

// TODO switch to overload so that the return type is different
const getBooleanValue = (key: string, defaultValue?: boolean): boolean | null => {
    const value = localStorage.getItem(key);
    if (_.isNil(value)) {
        if (_.isUndefined(defaultValue)) {
            return value;
        } else {
            return defaultValue;
        }
    } else {
        return value === true.toString();
    }
};

// TODO switch to overload so that the return type is different
const getDateValue = (key: string, defaultValue?: Date): Date | null => {
    const value = localStorage.getItem(key);
    if (_.isNil(value)) {
        if (_.isUndefined(defaultValue)) {
            return value;
        } else {
            return defaultValue;
        }
    } else {
        return new Date(value);
    }
};

const localPreferences = {
    topicPreferences: {
        get useSeconds(): boolean {
            // This cannot be null because of the default value
            return getBooleanValue(STUDENT_TOPIC_PREFERENCES_USE_SECONDS, true) as boolean;
        },
        set useSeconds(value: boolean) {
            setBooleanValue(STUDENT_TOPIC_PREFERENCES_USE_SECONDS, value);
        }
    },
    loggingPreferences: {
        get loggingLevel(): string {
            // This cannot be null because of the default value
            return getItemWithDefaultValue(LOGGING_LEVEL, process.env.NODE_ENV === 'production' ? 'error' : 'debug') as string;
        },
        set loggingLevel(value: string) {
            localStorage.setItem(LOGGING_LEVEL, value);
        }
    },
    general: {
        get loginRedirectURL(): string | null {
            return localStorage.getItem(GENERAL_LOGIN_REDIRECT_URL);
        },
        set loginRedirectURL(value: string | null) {
            if (_.isNil(value)) {
                localStorage.removeItem(GENERAL_LOGIN_REDIRECT_URL);
            } else {
                localStorage.setItem(GENERAL_LOGIN_REDIRECT_URL, value);
            }
        }
    },
    versionCheck: {
        get nextCheckDate() {
            return localStorage.getItem(VERSION_CHECK_DATE);
        },
        set nextCheckDate(value: string | null) {
            setItem(VERSION_CHECK_DATE, value);
        }
    },
    account: {
        get paidUntil(): Date | null {
            return getDateValue(ACCOUNT_PAID_UNTIL);
        },
        set paidUntil(value: Date | null) {
            setDateValue(ACCOUNT_PAID_UNTIL, value);
        },
        get accountOwner(): AccountType | null {
            const getValue = localStorage.getItem(ACCOUNT_OWNER);
            if (_.isNull(getValue)) {
                return null;
            } else if (Object.values(AccountType).includes(getValue as AccountType)) {
                return getValue as AccountType;
            } else {
                return null;
            }
        },
        set accountOwner(value: AccountType | null) {
            const owner = _.isNull(value) ? null : AccountType[value];
            setItem(ACCOUNT_OWNER, owner);
        },
        get accountStatus(): AccountType | null {
            const getValue = localStorage.getItem(ACCOUNT_OWNER);
            if (_.isNull(getValue)) {
                return null;
            } else if (Object.values(AccountType).includes(getValue as AccountType)) {
                return getValue as AccountType;
            } else {
                return null;
            }
        },
        set accountStatus(value: AccountType | null) {
            const status = _.isNull(value) ? null : AccountType[value];
            setItem(ACCOUNT_STATUS, status);
        }
    } ,
    session: {
        get userType(): string | null {
            return localStorage.getItem(SESSION_USER_TYPE);
        },
        set userType(value: string | null) {
            setItem(SESSION_USER_TYPE, value);
        },
        get userId(): string | null {
            return localStorage.getItem(SESSION_USER_ID);
        },
        set userId(value: string | null) {
            setItem(SESSION_USER_ID, value);
        },
        get userUUID(): string | null {
            return localStorage.getItem(SESSION_USER_UUID);
        },
        set userUUID(value: string | null) {
            setItem(SESSION_USER_UUID, value);
        },
        get username(): string | null {
            return localStorage.getItem(SESSION_USER_USERNAME);
        },
        set username(value: string | null) {
            setItem(SESSION_USER_USERNAME, value);
        },
        nullifySession: (): void => {
            const { session } = localPreferences;
            session.userType = null;
            session.userId = null;
            session.userUUID = null;
            session.username = null;
        }
    }
};

// THIS SHOULD BE COMMENTED OUT, it can be helpful for testing
// (window as any).localPreferences = localPreferences;

export default localPreferences;