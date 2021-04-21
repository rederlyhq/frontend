import React from 'react';
import { IMUIAlertModalState, useMUIAlertState } from '../Hooks/useAlertState';
import { Snackbar } from '@material-ui/core';
import { Alert as MUIAlert } from '@material-ui/lab';

type GlobalSnackbarContextProperties = React.Dispatch<React.SetStateAction<IMUIAlertModalState>>;

const GlobalSnackbarContext = React.createContext<GlobalSnackbarContextProperties | null>(null);

export const useGlobalSnackbarContext = () => React.useContext(GlobalSnackbarContext);

export const GlobalSnackbarProvider: React.FC<{}>  = ({ children }) => {
    const [{ message, severity }, setAlert] = useMUIAlertState();

    return (
        <GlobalSnackbarContext.Provider value={setAlert}>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={message !== ''}
                autoHideDuration={severity === 'success' ? 6000 : undefined}
                onClose={() => setAlert(alert => ({ ...alert, message: '' }))}
                style={{ maxWidth: '50vw' }}
            >
                <MUIAlert
                    onClose={() => setAlert(alert => ({ ...alert, message: '' }))}
                    severity={severity}
                    variant='filled'
                    style={{ fontSize: '1.1em' }}
                >
                    {message}
                </MUIAlert>
            </Snackbar>
            {children}
        </GlobalSnackbarContext.Provider>
    );
};
