import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { MomentReacter } from '../Components/MomentReacter';
import { CookieEnum } from '../Enums/CookieEnum';
import { unauthorizedRedirect } from '../Enums/UserRole';
import logger from '../Utilities/Logger';
import _ from 'lodash';
import { Modal } from 'react-bootstrap';

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

    // Went with polling from now
    // TODO optimize by embedding the expiration date into the cookie and having moment reacter
    const reactionTime = tokenExpiration.toMoment().add(1, 'second'); // Give the browser a buffer to clear the cookie
    return <MomentReacter stopMoment={reactionTime} significantMoments={[reactionTime]} logTag={'auth check'}>
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
                {children}
            </>;
        }}
    </MomentReacter>;
};
