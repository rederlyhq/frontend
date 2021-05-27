import React, {  } from 'react';
import { version as packageVersion } from '../../package.json';
import _ from 'lodash';
import { useVersionContext } from '../Contexts/VersionContext';
import { Chip } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';


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
            <Chip
                label={`Update now! (v${versionInfo.serverFrontend})`}
                clickable
                color='secondary'
                onClick={()=>window.location.reload}
                onDelete={()=>window.location.reload}
                deleteIcon={<Refresh />}
                style={{marginLeft: '5px'}}
            />
        }
    </>;
};
