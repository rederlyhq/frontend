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

/* EXAM SETTINGS */

const examFieldNamePrefix = 'topicAssessmentInfo';

export const durationField = (register: any) => (
    <FormControlLabel
        name={`${examFieldNamePrefix}.duration`}
        inputRef={register()}
        label={'Duration'}
        labelPlacement='start' 
        control={
            <TextField type='number' />
        }
    />
);

export const maxGradedAttemptsPerRandomizationField = (register: any) => (
    <FormControlLabel
        name={`${examFieldNamePrefix}.maxGradedAttemptsPerRandomization`}
        inputRef={register()}
        label={'Max Graded Attempts Per Randomization'}
        labelPlacement='start' 
        control={
            <TextField type='number' />
        }
    />
);

export const maxReRandomizationsField = (register: any) => (
    <FormControlLabel
        name={`${examFieldNamePrefix}.maxReRandomizations`}
        inputRef={register()}
        label={'Max ReRandomizations'}
        labelPlacement='start' 
        control={
            <TextField type='number' />
        }
    />
);

export const randomizationDelayField = (register: any) => (
    <FormControlLabel
        name={`${examFieldNamePrefix}.randomizationDelay`}
        inputRef={register()}
        label={'Randomization Delay'}
        labelPlacement='start' 
        control={
            <TextField type='number' />
        }
    />
);

export const generateSwitchField = (control: any, name: string) => (
    <Controller 
        name={`${examFieldNamePrefix}.${name}`}
        control={control} 
        defaultValue={false}
        // label={'Allow Partial Extensions'} 
        // labelPlacement='end' 
        // disabled={topicTypeId === TopicTypeId.EXAM}
        render={({ onChange, onBlur, value, name }) => (
            <Switch 
                onBlur={onBlur}
                onChange={e => onChange(e.target.checked)}
                color='primary'
                checked={value}
                value={value}
                name={name}
            />
        )} 
    />
);