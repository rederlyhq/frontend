import { AlertProps } from 'react-bootstrap';
import { useState } from 'react';

interface IAlertModalState {
    message: string;
    variant: AlertProps['variant'];
}

/**
 * This hook just provides additional typechecking for handling the state of Bootstrap Alerts.
 */
export const useAlertState = () => {
    return useState<IAlertModalState>({message: '', variant: 'danger'});
};

export default useAlertState;