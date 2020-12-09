import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import logger from '../Utilities/Logger';
import { getUserIdNoRedirect } from '../Enums/UserRole';

declare global {
    interface Window {
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
    trackingId: string | undefined = process.env.REACT_APP_GA_ID
) => {
    const { listen } = useHistory();

    useEffect(() => {
        const unlisten = listen((location) => {
            if (!window.gtag) {
                logger.error('GA module not loaded.');
                return;
            }
            if (!trackingId) {
                logger.error(
                    'Tracking not enabled, as `trackingId` was not given and there is no `REACT_APP_GA_ID`.'
                );
                return;
            }

            window.gtag('config', trackingId, {
                // We don't change the title with each request.
                page_title: location.pathname,
                page_path: location.pathname,
                user_id:  getUserIdNoRedirect()
            });
        });

        return unlisten;
    }, [trackingId, listen]);
};

export default useTracking;