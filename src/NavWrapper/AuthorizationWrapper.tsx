import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { MomentReacter } from '../Components/MomentReacter';
import { CookieEnum } from '../Enums/CookieEnum';
import { unauthorizedRedirect } from '../Enums/UserRole';
import logger from '../Utilities/Logger';
import _ from 'lodash';
import { Button, Modal } from 'react-bootstrap';
import moment from 'moment';
import { checkIn } from '../APIInterfaces/BackendAPI/Requests/UserRequests';

interface AuthorizationWrapperProps {
    children: React.ReactNode
}

export const AuthorizationWrapper: React.FC<AuthorizationWrapperProps> = ({
    children
}) => {
    const [tokenExpiration, setTokenExpiration] = useState<Date>(new Date());
    // The expiration date cannot be fetched from the cookie
    // Can't rely on it from login either because it updates
    // Could set a second cookie or embed it in the original cookie
    // const authExpirationDate = useState(() => {
    //     const sessionCookie = Cookies.get(CookieEnum.SESSION);
    //     return sessionCookie.expirationDate
    // });

    const renewSession = async () => {
        try {
            await checkIn();
            // This triggers a check immediately
            // I thought I would need a delay but it seems to work fine
            setTokenExpiration(new Date());
        } catch(e) {
            logger.error('Could not check in', e);
        }
    };

    // Went with polling from now
    // TODO optimize by embedding the expiration date into the cookie and having moment reacter
    const reactionTime = tokenExpiration.toMoment().add(1, 'second'); // Give the browser a buffer to clear the cookie
    const warningTime = tokenExpiration.toMoment().subtract(5, 'minute');
    return <MomentReacter stopMoment={reactionTime} significantMoments={[warningTime, reactionTime]} logTag={'auth check'}>
        {() => {
            const sessionCookie = Cookies.get(CookieEnum.SESSION);
            if(!sessionCookie) {
                unauthorizedRedirect(false);
                return <Redirect to={{
                    pathname: '/'
                }} />;
            }

            const splitToken = sessionCookie.split('_');
            if (splitToken.length > 1) {
                if (splitToken.length > 2) {
                    logger.warn('More than one `_` was found in session cookie, expected format UUID_EXPIRATION');
                }
                const expirationEpochString = splitToken[1];
                const expirationEpoch = parseInt(expirationEpochString, 10);
                if (_.negate(_.isNaN)(expirationEpoch)) {
                    if (expirationEpoch !== tokenExpiration.getTime()) {
                        setTokenExpiration(new Date(expirationEpoch));
                    }
                }
            }
            return <>
                <Modal
                    show={moment().isSameOrAfter(warningTime)}
                >
                    <Modal.Header>
                        <h5>Inactivity warning</h5>
                    </Modal.Header>
                    <Modal.Body>
                        Your session will end due to inactivity in <MomentReacter logTag="auth countdown" intervalInMillis={1000}>{() => <>{tokenExpiration.toMoment().formattedFromNow(false, 'm [minutes] [and] s [seconds]')}</>}</MomentReacter>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={renewSession}>Renew session</Button>
                    </Modal.Footer>
                </Modal>
                {children}
            </>;
        }}
    </MomentReacter>;
};
