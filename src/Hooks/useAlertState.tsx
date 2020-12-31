import React from 'react';
import { AlertProps } from 'react-bootstrap';
import { useState } from 'react';
import { Color } from '@material-ui/lab';

export interface IAlertModalState {
    message: string | React.ReactNode;
    variant: AlertProps['variant'];
}

export interface IMUIAlertModalState {
    message: string;
    severity: Color;
}

/**
 * This hook just provides additional typechecking for handling the state of Bootstrap Alerts.
 */
export const useAlertState = () => {
    return useState<IAlertModalState>({message: '', variant: 'danger'});
};

export default useAlertState;

export const useMUIAlertState = () => {
    return useState<IMUIAlertModalState>({message: '', severity: 'error'});
};