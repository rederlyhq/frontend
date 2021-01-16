import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

interface ProblemBrowserSearchDropDownProps<T> {
    options: Array<T>;
    comparator: (a: T, b: T) => boolean;
    getLabel: (arg: T) => string;
    control: Control;
    label: string;
    name: string;
    disabled?: boolean;
}

export const ProblemBrowserSearchDropDown = <T extends unknown>({
    options,
    comparator,
    getLabel,
    control,
    label,
    name,
    disabled,
}: ProblemBrowserSearchDropDownProps<T>) => (
        <Controller
            name={name}
            render={({ onChange, ...props}) =>
                <Autocomplete
                    options={options}
                    getOptionLabel={getLabel}
                    getOptionSelected={comparator}
                    onChange={(_event, data) => onChange(data)}
                    fullWidth={true}
                    style={{
                        padding: '1em'
                    }}
                    renderInput={(params: unknown) => <TextField {...params} label={label} variant="outlined" />}
                    {...props}
                    disabled={disabled}
                />
            }
            onChange={([, data]: [unknown, unknown]) => data}
            control={control}
            defaultValue={null}
        />
    );