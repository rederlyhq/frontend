import React from 'react';
import axios from 'axios';
import logger from './Logger';
import { version as packageVersion } from '../../package.json';
import moment from 'moment';
import _ from 'lodash';
import localPreferences from '../Utilities/LocalPreferences';

const { versionCheck } = localPreferences;

const getVersionFile = async () => {
    return axios.get<string>(`/version.txt?cache_bust=${new Date().getTime()}`);
};

const versionRefresh = async () => {
    // To test in development make a version.txt in the public folder with a value that matches or does not match package.json (i.e. "1.5.5")
    // Then comment out this check
    // version.txt in production is generated in post build
    if (process.env.NODE_ENV !== 'production') {
        logger.debug('Version Check: No cache buster in development');
        return;
    }
    try {
        const versionAxiosResponse = await getVersionFile();
        const versionResponse = versionAxiosResponse.data;
        if (packageVersion.trim() !== versionResponse.trim()) {
            logger.warn(`Version Check: Version mismatch packageVersion ${packageVersion} !== versionResponse ${versionResponse}`);
            const versionCheckDate = versionCheck.nextCheckDate;
            let shouldReload = false;
            if (_.isNil(versionCheckDate)) {
                shouldReload = true;
                logger.debug('Version Check: Time to try');
            } else if (moment().isAfter(moment(versionCheckDate))) {
                shouldReload = true;
                logger.debug(`Version Check: Time to try again ${versionCheckDate}`);
            } else {
                shouldReload = false;
                logger.error(`Version Check: Version mismatch packageVersion ${packageVersion} !== versionResponse ${versionResponse}. Too soon to try again ${versionCheckDate}`);
            }
    
            if (shouldReload) {
                // set the next time to the future
                versionCheck.nextCheckDate = moment().utc().add(1, 'days').format();
                window.location.reload();
            }
        } else {
            logger.debug('Version Check: Version matched');
            versionCheck.nextCheckDate = null;
        }
        return packageVersion;
    } catch (e) {
        logger.error('Version Check: Could not fetch version', e);
    }
};

// Should this be part of the component itself? on mount or unmount?
// I think of this as a global thing
versionRefresh();

interface VersionCheckProps {
    children: React.ReactNode;
}

export const VersionCheck: React.FC<VersionCheckProps> = ({
    children
}) => {
    // Thinking we might want the modal
    return (<>
        {children}
    </>);
};
