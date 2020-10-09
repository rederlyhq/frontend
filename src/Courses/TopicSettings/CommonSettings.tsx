import React, { useEffect } from 'react';
import { Button, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Switch, TextField } from '@material-ui/core';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
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
    const { isExam, partialExtend } = watch();

    useEffect(()=>{
        if (isExam === TopicTypeId.EXAM) {
            setValue('partialExtend', false);
        }
    }, [isExam]);

    return (
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h1>Core Topic Settings</h1></Grid>
            <Grid item md={8}>
                <TextField 
                    fullWidth 
                    name='name' 
                    inputRef={register()} 
                    label='Topic Title'
                />
            </Grid>
            {/* This is a workaround because setValue doesn't seem to cause a UI rerender. */}
            <Grid item md={12} style={{display: isExam === 'exam' ? 'none' : undefined}}>
                {/* ${partialCreditScore} = ((${gradeCandidate}- ${legalScore}) * ${topicLateScalar}) + ${legalScore} */}
                Allow students to receive partial credit after the end date of this topic. Partial credit is scaled for up to half the original weight of the topic.<br/>
                <FormControlLabel 
                    name='partialExtend'
                    inputRef={register()} 
                    label={'Allow Partial Extensions'} 
                    labelPlacement='end' 
                    disabled={isExam === TopicTypeId.EXAM}
                    control={
                        <Switch color='primary' />
                    } 
                />
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
                                    return startDate.isSameOrBefore(endDate) && startDate.isSameOrBefore(deadDate) || 'Start date cannot be after End or Dead dates';
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
                    <RadioGroup row aria-label="Topic Type" name="isExam">
                        <FormControlLabel inputRef={register()} labelPlacement='top' value={TopicTypeId.HOMEWORK} control={<Radio />} label="Homework" />
                        <FormControlLabel inputRef={register()} labelPlacement='top' value={TopicTypeId.EXAM} control={<Radio />} label="Exam" />
                    </RadioGroup>
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default CommonSettings;