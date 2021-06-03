// TODO: This will eventually be broken into Workers and SharedWorkers (for browsers that support it)
import React, { useEffect } from 'react';
import { useGlobalSnackbarContext } from '../../Contexts/GlobalSnackbar';
import { getJWT } from '../../APIInterfaces/BackendAPI/Requests/UserRequests';

export const NotificationWrapper: React.FC<any> = ({children}) => {
    const setAlert = useGlobalSnackbarContext();

    useEffect(()=>{
        let wss: WebSocket | null = null;

        (async ()=>{
            const {data: {data: token}} = await getJWT({scopes: undefined});
            wss = new WebSocket(`ws://test.rederly.com:3000/?token=${token}`, 'wss');

            wss.onopen = () => {
                console.log('Connection opened.');
                wss?.send('ping');
            };
    
            wss.onmessage = (event) => {
                console.log(event);
                setAlert?.({message: event.data, severity: 'success'});
            };

        })();

        return () => {wss && wss.close();};
    }, [setAlert]);

    return <>{children}</>;
};

export default NotificationWrapper;
