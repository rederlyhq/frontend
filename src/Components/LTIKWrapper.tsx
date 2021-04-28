import React, { useEffect } from 'react';
import { useQueryParam, StringParam } from 'use-query-params';
import localPreferences from '../Utilities/LocalPreferences';
import { useGlobalSnackbarContext } from '../Contexts/GlobalSnackbar';
import AxiosRequest from '../Hooks/AxiosRequest';
import { getUserRoleFromServer } from '../Enums/UserRole';
import _ from 'lodash';
const { general, session } = localPreferences;

interface LTIKWrapperProps {

}

/**
 * This is a wrapper that grabs an LTIK query parameter, if one exists, and exchanges it with the server for a session cookie.
 */
export const LTIKWrapper: React.FC<LTIKWrapperProps> = ({children}) => {
    const [ltik, setLtik] = useQueryParam('ltik', StringParam);
    const setAlert = useGlobalSnackbarContext();

    useEffect(()=>{
        (async () => {
            try {
                // If we already have a session userId, then don't repeat the request.
                if (_.isNil(ltik) || _.isEmpty(ltik)) return;

                if (session.userId) return;

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
            } catch (e) {
                setAlert?.({message: e.message, severity: 'error'});
            } finally {
                // Remove LTIK when done. It has been replaced with a session token.
                setLtik(undefined);
            }
        })();
    }, [ltik, setAlert, setLtik]);


    return ltik ? 
        <h1>Loading (LTI)</h1> :
        <>{children}</>;

};

export default LTIKWrapper;