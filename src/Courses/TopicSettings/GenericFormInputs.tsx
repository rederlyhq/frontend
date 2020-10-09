import React from 'react';
import { FormControlLabel, Switch, TextField } from '@material-ui/core';

// TODO: Clean up typing here. Probably needs a generic <T>.
export interface NestedFormInterface {
    // This is the register function from react-hook-forms.
    register: (ref: any) => void;
    // This is the control function from react-hook-forms, needed for complex components.
    control: any;
    // This is the watch function from react-hook-forms, needed for conditional rendering.
    watch: any;
}

export const ProblemMaxAttempts = (register: any) => (
    <TextField 
        name='maxAttempts' 
        inputRef={register()} 
        label='Max Graded Attempts'
        type='number'
        inputProps={{min: -1}}
    />
);

// TODO: Replace with MUI Autocomplete component
export const ProblemPath = (register: any) => (
    <TextField 
        fullWidth 
        name='webworkQuestionPath' 
        inputRef={register()} 
        label='Problem Path'
    />
);

export const ProblemWeight = (register: any) => (
    <TextField 
        name='weight' 
        inputRef={register()} 
        label='Weight'
        type='number'
        inputProps={{min: 0}}
    />
);

export const ProblemOptional = (register: any) => (
    <FormControlLabel 
        name='optional'
        inputRef={register()} 
        label={'Optional'}
        labelPlacement='end' 
        control={
            <Switch color='primary'/>
        } 
    />
);