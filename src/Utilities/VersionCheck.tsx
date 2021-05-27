import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logger from './Logger';
import { version as packageVersion } from '../../package.json';
import moment from 'moment';
import _ from 'lodash';
import localPreferences from '../Utilities/LocalPreferences';
import { useVersionContext } from '../Contexts/VersionContext';

const { versionCheck } = localPreferences;

interface VersionCheckProps {
}

export const VersionCheck: React.FC<VersionCheckProps> = () => {
    const versionInfo = useVersionContext();

    if (_.isNil(versionInfo) || _.isNil(versionInfo.serverFrontend)) {
        return <>You&apos;re using v{packageVersion} of Rederly!</>;
    }

    return <>
        You&apos;re using v{packageVersion} of Rederly! 
        {versionInfo.serverFrontend !== packageVersion && 
            <button
                tabIndex={0}
                onClick={() => window.location.reload()}
                style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '0px 0px 0px 3px',
                    color: '#0EF',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                }}
            >
                v{versionInfo.serverFrontend} is now available!
            </button>
        }
    </>;
};
