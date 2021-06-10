// TODO: This will eventually be broken into Workers and SharedWorkers (for browsers that support it)
import React, { useEffect } from 'react';
import { useGlobalSnackbarContext } from '../../Contexts/GlobalSnackbar';
import { getJWT } from '../../APIInterfaces/BackendAPI/Requests/UserRequests';
import logger from '../Logger';

export const NotificationWrapper: React.FC<any> = ({children}) => {
    const setAlert = useGlobalSnackbarContext();

    useEffect(()=>{
        let wss: WebSocket | null = null;

        (async ()=>{
            try {
                const {data: {data: token}} = await getJWT({scopes: undefined});
                wss = new WebSocket(`ws://test.rederly.com:3009/?token=${token}`, 'wss');
        
                wss.onmessage = (event) => {
                    console.log(event);
                    setAlert?.({message: JSON.parse(event.data).message, severity: 'success'});
                };
            } catch(e) {
                logger.error(e);
                setAlert?.({message: 'Notifications are not enabled.', severity: 'warning'});
            }
        })();

        return () => {wss && wss.close();};
    }, [setAlert]);

    return <>{children}</>;
};

export default NotificationWrapper;
