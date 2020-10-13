import React, { useEffect } from 'react';
import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Switch, TextField } from '@material-ui/core';
import { DateTimePicker } from '@material-ui/pickers';
import moment, { Moment } from 'moment';
import { Controller } from 'react-hook-form';
import { TopicTypeId } from '../../Enums/TopicType';

interface CommonSettingsProps {
    // This is the register function from react-hook-forms.
    formObject: any
}

/**
 * This component renders settings that are common to all Topic objects.
 * 
 */
export const CommonSettings: React.FC<CommonSettingsProps> = ({formObject}) => {
    const { register, getValues, errors, control, setValue, watch, formState, reset } = formObject;
    const { topicTypeId, partialExtend } = watch();

    useEffect(()=>{
        if (topicTypeId === TopicTypeId.EXAM) {
            setValue('partialExtend', false);
        }
    }, [topicTypeId]);

    return (
        <Grid container item md={12} spacing={3}>
            <Grid item md={8}>
                <TextField 
                    fullWidth 
                    name='name' 
                    inputRef={register()} 
                    label='Topic Title'
                    InputLabelProps={{ shrink: true }}
                    inputProps={{style: {fontSize: '2.5rem'}}}
                />
            </Grid>
            <Grid item container md={12}><h2>Core Topic Settings</h2></Grid>
            {/* This is a workaround because setValue doesn't seem to cause a UI rerender. */}
            <Grid item md={12} style={{display: topicTypeId === 'exam' ? 'none' : undefined}}>
                {/* ${partialCreditScore} = ((${gradeCandidate}- ${legalScore}) * ${topicLateScalar}) + ${legalScore} */}
                Allow students to receive partial credit after the end date of this topic. Partial credit is scaled for up to half the original weight of the topic.<br/>

                {/* <Switch color='primary' inputProps={{type: 'checkbox'}} name='partialExtend' inputRef={register()} /> */}
                <Controller 
                    name='partialExtend'
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
                {/* <FormControlLabel 
                    name='partialExtend'
                    inputRef={register()} 
                    label={'Allow Partial Extensions'} 
                    labelPlacement='end' 
                    disabled={topicTypeId === TopicTypeId.EXAM}
                    control={
                        <Switch color='primary' inputProps={{type: 'checkbox'}} />
                    } 
                /> */}
            </Grid>
            <Grid item container md={12} spacing={3}>
                <Grid item>
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name='startDate'
                        control={control}
                        autoOk
                        variant='inline'
                        inputVariant='outlined'
                        fullWidth={false}
                        label='Start Date'
                        rules={{
                            required: true,
                            validate: {
                                isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                                isEarliest: (startDate: Moment) => {
                                    const { endDate, deadDate } = getValues();
                                    return (startDate.isSameOrBefore(endDate) && startDate.isSameOrBefore(deadDate)) || 'Start date cannot be after End or Dead dates';
                                }
                            }
                        }}
                    />
                </Grid>
                <Grid item>
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name="endDate"
                        control={control}
                        autoOk
                        variant="inline"
                        inputVariant='outlined'
                        fullWidth={false}
                        label='End Date'
                        rules={{
                            required: true,
                            validate: {
                                isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                                // isEarliest: (startDate: Moment) => {
                                //     const { endDate, deadDate } = getValues();
                                //     return startDate.isSameOrBefore(endDate) && startDate.isSameOrBefore(deadDate) || 'Start date cannot be after End or Dead dates';
                                // }
                            }
                        }}
                    />
                </Grid>
                <Grid item>
                    {partialExtend && 
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name="deadDate"
                        control={control}
                        autoOk
                        variant='inline'
                        inputVariant='outlined'
                        fullWidth={false}
                        label='Dead Date'
                        rules={{
                            required: true,
                            validate: {
                                isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                                // isEarliest: (startDate: Moment) => {
                                //     const { endDate, deadDate } = getValues();
                                //     return startDate.isSameOrBefore(endDate) && startDate.isSameOrBefore(deadDate) || 'Start date cannot be after End or Dead dates';
                                // }
                            }
                        }}
                    />}
                </Grid>
            </Grid>
            <Grid item md={12}>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Topic Type</FormLabel>
                    <Controller
                        as={
                            <RadioGroup row aria-label="Topic Type">
                                <FormControlLabel labelPlacement='top' value={TopicTypeId.HOMEWORK} control={<Radio />} label="Homework" />
                                <FormControlLabel labelPlacement='top' value={TopicTypeId.EXAM} control={<Radio />} label="Exam" />
                            </RadioGroup>
                        }
                        control={control}
                        name='topicTypeId'
                    />
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default CommonSettings;