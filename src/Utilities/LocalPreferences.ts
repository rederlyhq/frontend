import _ from 'lodash';

const STUDENT_TOPIC_PREFERENCES_USE_SECONDS = 'STUDENT_TOPIC_PREFERENCES_USE_SECONDS';
const LOGGING_LEVEL = 'LOGGING_LEVEL';
const VERSION_CHECK_DATE = 'VERSION_CHECK_DATE'; 
const GENERAL_LOGIN_REDIRECT_URL = 'GENERAL_LOGIN_REDIRECT_URL'; 

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

const setBooleanValue = (key: string, value: boolean) => {
    localStorage.setItem(key, value.toString());
};

// TODO switch to overload so that the return type is different
const getBooleanValue = (key: string, defaultValue?: boolean): boolean | null => {
    const value = localStorage.getItem(key);
    if (_.isNil(value)) {
        if(_.isUndefined(defaultValue)) {
            return value;
        } else {
            return defaultValue;
        }
    } else {
        return value === true.toString();
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
            if (_.isNil(value)) {
                localStorage.removeItem(VERSION_CHECK_DATE);
            } else {
                localStorage.setItem(VERSION_CHECK_DATE, value);
            }
        }
    }
};

// THIS SHOULD BE COMMENTED OUT, it can be helpful for testing
// (window as any).localPreferences = localPreferences;

export default localPreferences;