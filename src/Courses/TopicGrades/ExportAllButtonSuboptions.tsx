import React from 'react';
import { ButtonOptions } from './ExportAllButton';
import { MenuItem } from '@material-ui/core';

interface ExportAllButtonSuboptionsProp {
    value: ButtonOptions;
    buttonState: ButtonOptions;
    setButtonState: (value: React.SetStateAction<ButtonOptions>) => void;
    setOpen: (value: React.SetStateAction<boolean>) => void;
}

export const ExportAllButtonSuboptions: React.FC<ExportAllButtonSuboptionsProp> = ({value, buttonState, setButtonState, setOpen}) => {
    // if (value === ButtonOptions.DOWNLOAD  && loading !== LoadingState.SUCCESS) return null;
    // if (value === ButtonOptions.PRINT_SINGLE && _.isNil(userId) return null;

    return <MenuItem
        key={value}
        disabled={false}
        selected={value === buttonState}
        onClick={() => {setButtonState(value); setOpen(false);}}
    >
        {value}
    </MenuItem>;
};
