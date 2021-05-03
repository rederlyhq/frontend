import React, { useEffect } from 'react';
import { useQueryParam, StringParam } from 'use-query-params';
import localPreferences from '../Utilities/LocalPreferences';
import { useGlobalSnackbarContext } from '../Contexts/GlobalSnackbar';
import AxiosRequest from '../Hooks/AxiosRequest';
import { getUserRoleFromServer } from '../Enums/UserRole';
import _ from 'lodash';
import { useBackdropContext } from '../Contexts/BackdropContext';
import logger from '../Utilities/Logger';
const { general, session } = localPreferences;

interface LTIKWrapperProps {

}

/**
 * This is a wrapper that grabs an LTIK query parameter, if one exists, and exchanges it with the server for a session cookie.
 */
export const LTIKWrapper: React.FC<LTIKWrapperProps> = ({children}) => {
    const [ltik, setLtik] = useQueryParam('ltik', StringParam);
    const setAlert = useGlobalSnackbarContext();
    const setShowBackdropLoading = useBackdropContext();

    useEffect(()=>{
        (async () => {
            try {
                // If we already have a session userId, then don't repeat the request.
                if (_.isNil(ltik) || _.isEmpty(ltik)) {
                    logger.debug('Returning early because LTIK is empty.', ltik);
                    return;
                }

                if (session.userId) {
                    logger.debug('Returning early because Session already exists.');
                    setLtik(undefined);
                    return;
                }

                setShowBackdropLoading?.(true);

                const resp = await AxiosRequest.get('/users/session', {
                    params: {
                        ltik: ltik
                    }
                });
                session.userId = resp.data.data.userId;
                session.userType = getUserRoleFromServer(resp.data.data.roleId);
                session.actualUserType = session.userType;
                session.userUUID = resp.data.data.uuid;
                session.username = `${resp.data.data.firstName} ${resp.data.data.lastName}`;
                // gaTrackLogin('LTI', session.userId);
                // Remove LTIK when done. It has been replaced with a session token.
                setLtik(undefined);
            } catch (e) {
                setAlert?.({message: e.message, severity: 'error'});
                // Remove LTIK when done. It has been replaced with a session token.
                setLtik(undefined);
            } finally {
                setShowBackdropLoading?.(false);
            }
        })();
    }, [ltik, setAlert, setLtik, setShowBackdropLoading]);


    return ltik ? <>Loading</> : <>{children}</>;

};

export default LTIKWrapper;