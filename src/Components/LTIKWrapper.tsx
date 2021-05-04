import React, { useEffect, useState } from 'react';
import { useQueryParam, StringParam } from 'use-query-params';
import localPreferences from '../Utilities/LocalPreferences';
import { useGlobalSnackbarContext } from '../Contexts/GlobalSnackbar';
import AxiosRequest from '../Hooks/AxiosRequest';
import { getUserRoleFromServer } from '../Enums/UserRole';
import _ from 'lodash';
import { useBackdropContext } from '../Contexts/BackdropContext';
import logger from '../Utilities/Logger';
import { Modal } from 'react-bootstrap';
import LTISetPassword from './LTISetPassword';
const { general, session } = localPreferences;

interface LTIKWrapperProps {

}

/**
 * This is a wrapper that grabs an LTIK query parameter, if one exists, and exchanges it with the server for a session cookie.
 */
export const LTIKWrapper: React.FC<LTIKWrapperProps> = ({children}) => {
    const [ltik, setLtik] = useQueryParam('ltik', StringParam);
    const [showSetPassword, setShowSetPassword] = useState<boolean>(false);
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
                session.hasPassword = resp.data.data.hasPassword;
                // gaTrackLogin('LTI', session.userId);
            } catch (e) {
                setAlert?.({message: e.message, severity: 'error'});
            } finally {
                if (!session.hasPassword) {
                    setShowSetPassword(true);
                } else {
                    // Remove LTIK when done. It has been replaced with a session token.
                    setLtik(undefined);
                }
                setShowBackdropLoading?.(false);
            }
        })();
    }, [ltik, setAlert, setLtik, setShowBackdropLoading]);

    const onDone = () => {
        setLtik(undefined);
        setShowSetPassword(false);
        session.hasPassword = false;
    };

    return <>
        {ltik ? 
            <>
                <Modal show={showSetPassword} onHide={_.noop}>
                    <Modal.Header>
                        You must set a password.
                    </Modal.Header>
                    <Modal.Body>
                        <LTISetPassword onDone={onDone} ltik={ltik} />
                    </Modal.Body>
                </Modal>
                Loading
            </> : 
            <>
                {children}
            </>
        }
    </>;

};

export default LTIKWrapper;