import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import logger from '../Utilities/Logger';
import { version as packageVersion } from '../../package.json';
import localPreferences from '../Utilities/LocalPreferences';
import moment from 'moment';
import _ from 'lodash';

const { versionCheck } = localPreferences;

interface VersionInformation {
    serverFrontend?: string;
    currentFrontend: string;
}

const getVersionFile = async () => {
    return axios.get<string>(`/version.txt?cache_bust=${new Date().getTime()}`);
};


const versionRefresh = async () => {
    // To test in development make a version.txt in the public folder with a value that matches or does not match package.json (i.e. "1.5.5")
    // Then comment out this check
    // version.txt in production is generated in post build
    // if (process.env.NODE_ENV !== 'production') {
    //     logger.debug('Version Check: No cache buster in development');
    //     return;
    // }
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
                // Using the reload flag is deprecated, however not using it did not seem to work, trying it out in case browsers support it
                window.location.reload(true);
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

const VersionContext = React.createContext<VersionInformation>({currentFrontend: packageVersion});

export const useVersionContext = () => React.useContext(VersionContext);

export const VersionProvider: React.FC<{}>  = ({ children }) => {
    const [serverFrontendVersionInfo, setServerFrontendVersionInfo] = useState<string>();

    const getVersionInfo = useCallback(async () => {
        try {
            const serverFrontendResponse = await getVersionFile();
            setServerFrontendVersionInfo(serverFrontendResponse.data);
        } catch (e) {
            logger.error('Version Check: Could not fetch version', e);
        }
    }, [setServerFrontendVersionInfo]);

    useEffect(()=>{
        (function setVersionInterval() {
            getVersionInfo();
            setTimeout(setVersionInterval, 1200000);
        })();
    }, [getVersionInfo]);

    // We only auto-reload on mount.
    useEffect(()=>{
        versionRefresh();
    }, []);

    return (
        <VersionContext.Provider value={{
            currentFrontend: packageVersion,
            serverFrontend: serverFrontendVersionInfo
        }}>
            {children}
        </VersionContext.Provider>
    );
};
