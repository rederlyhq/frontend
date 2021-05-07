import React from 'react';
import { FormControlLabel, Switch, TextField, FormLabel } from '@material-ui/core';
import _ from 'lodash';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import ChipInput from 'material-ui-chip-input';
import { ErrorMessage } from '@hookform/error-message';
import { Constants } from '../../Utilities/Constants';
import QuillControlledEditor from '../../Components/Quill/QuillControlledEditor';
import { GenericConfirmAttachmentUploadOptions } from '../../APIInterfaces/BackendAPI/RequestTypes/CourseRequestTypes';
import AttachmentType from '../../Enums/AttachmentTypeEnum';

/* PROBLEM SETTINGS */
export const ProblemMaxAttempts: React.FC<{}> = () => {
    const { register, errors } = useFormContext();
    const name = 'maxAttempts';

    return (
        <>
            <TextField
                name={name}
                inputRef={register({
                    required: true
                })}
                error={Boolean(errors[name])}
                helperText={errors[name] ? 'Required.' : null}
                label='Max Graded Attempts'
                type='number'
                inputProps={{min: -1}}
            />
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
                helperText={errors[name] ? 'Invalid path.' : null}
                inputRef={register({
                    pattern: Constants.Renderer.VALID_PROBLEM_PATH_REGEX,
                    required: true,
                })}
                error={Boolean(errors[name])}
                label='Problem Path'
            />
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
                inputRef={register({
                    required: true
                })}
                error={Boolean(errors[name])}
                helperText={errors[name] ? 'Required.' : null}
                label='Weight'
                type='number'
                inputProps={{min: 0}}
            />
        </>
    );
};

export const ToggleField: React.FC<{name: string, label: string}> = ({name, label}) => {
    const { control, errors } = useFormContext();

    return (
        <>
            <Controller
                name={name}
                control={control}
                defaultValue={false}
                render={({ onChange, onBlur, value, name }) => (
                    <FormControlLabel
                        name={name}
                        label={label}
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
                        onBlur={onBlur}
                        // Using the value prop turns this into a controlled component, which
                        // would require using onAdd/onDelete instead of onChange.
                        defaultValue={_(value).map(_.toString).uniq().value()}
                        value={_(value).map(_.toString).uniq().value()}
                        onAdd={(chip) => onChange(_.uniq([...value, parseInt(chip, 10)]))}
                        onDelete={(chip) => onChange(_.without(value, parseInt(chip, 10), chip.toString()))}
                        clearInputValueOnChange={true}
                        blurBehavior='add'
                        helperText={errMsg && <span style={{color: 'red'}}>{errMsg}</span>}
                        placeholder='9135, 1534, 447'
                        newChipKeys={['Enter', 'Separator']}
                        newChipKeyCodes={[13, 188]}
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

export const MultipleProblemPaths: React.FC = () => {
    const fieldArrayName = 'additionalProblemPaths';
    const nestedName = `${examProblemFieldNamePrefix}.${fieldArrayName}`;
    const { register, errors } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        name: nestedName
    });

    return (
        <div>
            {fields.map((item, index) => (
                <TextField
                    key={item.id}
                    fullWidth
                    name={`${nestedName}[${index}].path`}
                    InputLabelProps={{shrink: true}}
                    label={`Problem Path ${index + 1}`}
                    defaultValue={`${item.path}`}
                    helperText={errors?.[examProblemFieldNamePrefix]?.[fieldArrayName]?.[index] ? 'Invalid path.' : null}
                    error={!!(errors?.[examProblemFieldNamePrefix]?.[fieldArrayName]?.[index])}
                    inputRef={register({
                        pattern: Constants.Renderer.VALID_PROBLEM_PATH_REGEX,
                        required: index === 0,
                    })}
                    onBlur={(e: any)=>{
                        // If the user deleted something and it's not the last field, remove it.
                        if (e.target.value === '' && index !== fields.length - 1) {
                            remove(index);
                        }
                    }}
                    onFocus={()=> {
                        // If the user entered something in the field and it's the last field,
                        // add a new empty field.
                        if (index === fields.length - 1) {
                            append({path: ''}, false);
                        }
                    }}
                />
            ))
            }
        </div>
    );
};

/* EXAM SETTINGS */

const examFieldNamePrefix = 'topicAssessmentInfo';

export const DurationField: React.FC<{}> = () => {
    const { register, errors } = useFormContext();
    const name = `${examFieldNamePrefix}.duration`;
    
    return (
        <TextField
            name={name}
            InputLabelProps={{ shrink: true }}
            inputRef={register()}
            label={'Time Limit (minutes)'}
            type='number'
            inputProps={{min: 2}}
            error={Boolean(errors[name])}
            helperText={errors[name] ? 'Error.' : null}
        />
    );
};

export const MaxGradedAttemptsPerVersionField: React.FC<{}> = () => {
    const { register, errors } = useFormContext();
    const name = `${examFieldNamePrefix}.maxGradedAttemptsPerVersion`;
    return (
        <TextField
            name={name}
            inputRef={register()}
            label={'Submissions per Version'}
            type='number'
            InputLabelProps={{style: {width: 'max-content'}, shrink: true}}
            error={Boolean(errors[name])}
            helperText={errors[name] ? 'Error.' : null}
        />
    );
};

export const MaxVersionsField: React.FC<{}> = () => {
    const { register, errors } = useFormContext();
    const name = `${examFieldNamePrefix}.maxVersions`;
    return (
        <TextField
            name={name}
            InputLabelProps={{ shrink: true }}
            inputRef={register()}
            label={'Available Versions'}
            type='number'
            error={Boolean(errors[name])}
            helperText={errors[name] ? 'Error.' : null}
        />
    );
};

export const RandomizationDelayField: React.FC<{}> = () => {
    const { register, errors } = useFormContext();
    const name = `${examFieldNamePrefix}.versionDelay`;

    return (
        <TextField
            name={name}
            label={'Delay Between Versions (minutes)'}
            InputLabelProps={{ shrink: true }}
            inputRef={register()}
            type='number'
            error={Boolean(errors[name])}
            helperText={errors[name] ? 'Error.' : null}
        />
    );
};

// Generic Generators

export const GenerateSwitchField: React.FC<{fieldName: string, label: string}> = ({fieldName, label}) => {
    const { control, errors } = useFormContext();
    const name = `${examFieldNamePrefix}.${fieldName}`;

    return (
        <Controller
            name={name}
            control={control}
            defaultValue={false}
            error={Boolean(errors[name])}
            helperText={errors[name] ? 'Error.' : null}
            render={({ onChange, onBlur, value, name }) => (
                <FormControlLabel
                    // label={_.startCase(fieldName)}
                    label={label}
                    labelPlacement='end'
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

export const GenerateQuillField: React.FC<{
    fieldName: string, 
    label: string, 
    uploadConfirmation?: (params: GenericConfirmAttachmentUploadOptions) => Promise<void>,
    attachmentType?: AttachmentType
}> = ({fieldName, label, uploadConfirmation, attachmentType}) => {
    const { control, errors } = useFormContext();
    const name = fieldName;

    return (
        <>
            <FormLabel component="legend">{label}</FormLabel>
            <Controller
                name={name}
                control={control}
                defaultValue={false}
                error={Boolean(errors[name])}
                helperText={errors[name] ? 'Error.' : null}
                render={({ onChange, onBlur, value }) => (
                    <QuillControlledEditor
                        onBlur={onBlur}
                        onChange={onChange}
                        value={value}
                        // Should this be generic?
                        attachmentType={attachmentType}
                        uploadConfirmation={uploadConfirmation}
                    />
                )}
            />
        </>
    );
};
