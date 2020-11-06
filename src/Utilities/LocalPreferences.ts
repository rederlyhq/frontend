import _ from 'lodash';

const STUDENT_TOPIC_PREFERENCES_USE_SECONDS = 'STUDENT_TOPIC_PREFERENCES_USE_SECONDS';

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
};

export default localPreferences;