import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import logger from '../Utilities/Logger';
import { getUserIdNoRedirect, getUserRoleNoRedirect } from '../Enums/UserRole';
import { useConfigContext } from '../Contexts/ConfigProvider';

declare global {
    interface Window {
        GA_TRACKING_ID: string;
        gtag?: (
            key: string,
            trackingId: string,
            config: {
                page_path?: string,
                user_id?: string | null | undefined,
                [x: string]: any
            }
        ) => void
    }
}

export const gaTrackLogin = (method: 'EMAIL' | 'BLACKBOARD', user_id: string | null) => window.gtag?.(
    'event', 'login', {
        method: method,
        user_id: user_id,
    }
);

export const gaTrackEnroll = (class_code: string) => window.gtag?.(
    'event', 'join_group', {
        group_id: class_code
    }
);

export const useTracking = (
    trackingId: string | undefined = window.GA_TRACKING_ID
) => {
    const { listen } = useHistory();
    const config = useConfigContext();

    useEffect(() => {
        const unlisten = listen((location) => {
            if (!window.gtag) {
                logger.error('GA module not loaded.');
                return;
            }
            if (!trackingId) {
                logger.error(
                    'Tracking not enabled, as `trackingId` was not given and there is no `window.GA_TRACKING_ID`.'
                );
                return;
            }

            window.gtag('config', trackingId, {
                // We don't change the title with each request.
                page_title: location.pathname,
                page_path: location.pathname,
                user_id:  getUserIdNoRedirect(),
                Role: getUserRoleNoRedirect(),
                cookie_domain: config?.domain,
                cookie_flags: 'SameSite=None;Secure',
                // debug_mode: true
            });
        });

        return unlisten;
    }, [trackingId, listen, config?.domain]);
};

export default useTracking;