import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import logger from '../Utilities/Logger';

declare global {
  interface Window {
    gtag?: (
      key: string,
      trackingId: string,
      config: { page_path: string }
    ) => void
  }
}

export const useTracking = (
    trackingId: string | undefined = process.env.REACT_APP_GA_ID
) => {
    const { listen } = useHistory();

    useEffect(() => {
        console.log('Tracking ID: ', process.env.REACT_APP_GA_ID);
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

            window.gtag('config', trackingId, { page_path: location.pathname });
        });

        return unlisten;
    }, [trackingId, listen]);
};

export default useTracking;