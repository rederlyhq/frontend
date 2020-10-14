import React from 'react';
import { FormControlLabel, Switch, TextField } from '@material-ui/core';
import _ from 'lodash';
import { Controller } from 'react-hook-form';

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

/* EXAM SETTINGS */

const examFieldNamePrefix = 'topicAssessmentInfo';

export const durationField = (register: any) => (
    <TextField 
        name={`${examFieldNamePrefix}.duration`}
        inputRef={register()}
        label={'Duration'}
        type='number'
    />
);

export const maxGradedAttemptsPerRandomizationField = (register: any) => (
    <TextField 
        name={`${examFieldNamePrefix}.maxGradedAttemptsPerRandomization`}
        inputRef={register()}
        label={'Max Graded Attempts Per Randomization'}
        type='number'
        InputLabelProps={{style: {width: 'max-content'}}}
    />
);

export const maxReRandomizationsField = (register: any) => (
    <TextField 
        name={`${examFieldNamePrefix}.maxReRandomizations`}
        inputRef={register()}
        label={'Max Re-Randomizations'}
        type='number'
    />
);

export const randomizationDelayField = (register: any) => (
    <TextField 
        name={`${examFieldNamePrefix}.randomizationDelay`}
        label={'Randomization Delay'}
        inputRef={register()}
        type='number'
    />
);

export const generateSwitchField = (control: any, fieldName: string) => (
    <Controller 
        name={`${examFieldNamePrefix}.${fieldName}`}
        control={control} 
        defaultValue={false}
        render={({ onChange, onBlur, value, name }) => (
            <FormControlLabel
                label={_.startCase(fieldName)}
                labelPlacement='start'
                control={<Switch 
                    onBlur={onBlur}
                    onChange={e => onChange(e.target.checked)}
                    color='primary'
                    checked={value}
                    value={value}
                    name={name}
                />}
            />
        )} 
    />
);

/* PROBLEM SETTINGS */
export const OptionalField = (control: any) => (
    <Controller 
        name='optional'
        control={control}
        defaultValue={false}
        render={({ onChange, onBlur, value, name }) => (
            <FormControlLabel 
                name='optional'
                label={'Optional'} 
                labelPlacement='end'
                control={
                    <Switch 
                        onBlur={onBlur}
                        onChange={e => onChange(e.target.checked)}
                        color='primary'
                        checked={value}
                        value={value}
                        name={name}
                    />
                }
            />
        )} 
    />
);