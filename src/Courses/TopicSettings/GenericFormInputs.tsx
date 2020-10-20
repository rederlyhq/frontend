import React from 'react';
import { FormControlLabel, Switch, TextField } from '@material-ui/core';
import _ from 'lodash';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import ChipInput from 'material-ui-chip-input';
import { ErrorMessage } from '@hookform/error-message';

/* PROBLEM SETTINGS */
export const ProblemMaxAttempts: React.FC<{}> = () => {
    const { register, errors } = useFormContext();
    const name = 'maxAttempts';

    return (
        <>
            <TextField 
                name={name}
                inputRef={register()} 
                label='Max Graded Attempts'
                type='number'
                inputProps={{min: -1}}
            />
            <ErrorMessage name={name} errors={errors} />
        </>
    );
};

// TODO: Replace with MUI Autocomplete component
export const ProblemPath: React.FC<{}> = () => {
    const { register, errors } = useFormContext();
    const name = 'webworkQuestionPath';

    return (
        <>
            <TextField 
                fullWidth 
                name={name} 
                inputRef={register()} 
                label='Problem Path'
            />
            <ErrorMessage name={name} errors={errors} />
        </>
    );
};

export const ProblemWeight: React.FC<{}> = () => {
    const { register, errors } = useFormContext();
    const name = 'weight';

    return (
        <>
            <TextField 
                name={name} 
                inputRef={register()} 
                label='Weight'
                type='number'
                inputProps={{min: 0}}
            />
            <ErrorMessage name={name} errors={errors} />
        </>
    );
};

export const OptionalField: React.FC<{}> = () => {
    const { control, errors } = useFormContext();
    const name = 'optional';
    
    return (
        <>
            <Controller 
                name={name}
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
            <ErrorMessage name={name} errors={errors} />
        </>
    );
};

const examProblemFieldNamePrefix = 'courseQuestionAssessmentInfo';

export const RandomSeedSet: React.FC<{}> = () => {
    const { control, errors } = useFormContext();
    const name = `${examProblemFieldNamePrefix}.randomSeedSet`;
    const errMsg = errors?.[examProblemFieldNamePrefix]?.randomSeedSet?.message;
    
    return (
        <>
            <Controller
                name={name}
                control={control}
                render={({ onChange, onBlur, value /* name */ }) => (
                    <ChipInput
                        onChange={onChange}
                        onBlur={onBlur}
                        // Using the value prop turns this into a controlled component, which
                        // would require using onAdd/onDelete instead of onChange.
                        defaultValue={value}
                        blurBehavior='add'
                        helperText={errMsg && <span style={{color: 'red'}}>{errMsg}</span>}
                        // We could use this to prevent validation, but it makes it easy to accidentally submit.
                        // TODO: Move HandleSubmit to the submit button to fix accidental submissions?
                        // onBeforeAdd={val => !_.isNaN(_.toNumber(val))}
                    />
                )}
                rules={{
                    required: false,
                    validate: (arr: string[]) => {
                        return _.every(arr, val => !_.isNaN(_.toNumber(val))) || 'All values must be numbers';
                    }
                }}
            />
        </>
    );
};

export const MultipleProblemPaths: React.FC = ({}) => {
    const fieldArrayName = 'additionalProblemPaths';
    const nestedName = `${examProblemFieldNamePrefix}.${fieldArrayName}`
    const { register, errors } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        name: nestedName
    });
    
    console.log(nestedName, 'MultiplePaths Fields', fields);

    return (
        <ul style={{listStyleType: 'none'}}>
            {fields.map((item, index) => (
                    <li key={item.id}>
                        <TextField 
                            fullWidth 
                            name={`${nestedName}[${index}].path`} 
                            inputRef={register()} 
                            label={`Problem Path ${index + 1}`}
                            defaultValue={`${item.path}`}
                            onBlur={(e: any)=>{
                                if (e.target.value !== '' && index === fields.length - 1) append({path: ''}, true);
                            }}
                        />
                    </li>
                ))
            }
        </ul>
    )
}

/* EXAM SETTINGS */

const examFieldNamePrefix = 'topicAssessmentInfo';

export const DurationField: React.FC<{}> = () => {
    const { register, errors } = useFormContext();

    return (
        <TextField 
            name={`${examFieldNamePrefix}.duration`}
            inputRef={register()}
            label={'Duration'}
            type='number'
        />
    );
};

export const MaxGradedAttemptsPerVersionField: React.FC<{}> = () => {
    const { register, errors } = useFormContext();

    return (
        <TextField 
            name={`${examFieldNamePrefix}.maxGradedAttemptsPerVersion`}
            inputRef={register()}
            label={'Max Graded Attempts Per Version'}
            type='number'
            InputLabelProps={{style: {width: 'max-content'}}}
        />
    );
};

export const MaxVersionsField: React.FC<{}> = () => {
    const { register, errors } = useFormContext();

    return (
        <TextField 
            name={`${examFieldNamePrefix}.maxVersions`}
            inputRef={register()}
            label={'Max Versions'}
            type='number'
        />
    );
};

export const RandomizationDelayField: React.FC<{}> = () => {
    const { register, errors } = useFormContext();

    return (
        <TextField 
            name={`${examFieldNamePrefix}.versionDelay`}
            label={'Version Delay'}
            inputRef={register()}
            type='number'
        />
    );
};

// Generic Generators

export const GenerateSwitchField: React.FC<{fieldName: string}> = ({fieldName}) => {
    const { control, errors } = useFormContext();
    
    return (
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
};
