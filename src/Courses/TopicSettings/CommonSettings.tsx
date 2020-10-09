import MomentUtils from '@date-io/moment';
import { Button, FormControlLabel, Grid, Switch, TextField } from '@material-ui/core';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import moment, { Moment } from 'moment';
import React from 'react';
import { Controller } from 'react-hook-form';

interface CommonSettingsProps {
    // This is the register function from react-hook-forms.
    register: any;
    control: any;
    watch: any;
    getValues: any;
}

/**
 * This component renders settings that are common to all Topic objects.
 * 
 */
export const CommonSettings: React.FC<CommonSettingsProps> = ({register, control, watch, getValues}) => {
    const { isExam, partialExtend } = watch();

    return (
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h1>Core Topic Settings</h1></Grid>
            <Grid item md={12}>
                <TextField 
                    fullWidth 
                    name='name' 
                    inputRef={register()} 
                    label='Topic Title'
                />
            </Grid>
            <Grid item md={12}>
                <FormControlLabel 
                    name='partialExtend'
                    inputRef={register()} 
                    label={'Allow Partial Extensions'} 
                    labelPlacement='end' 
                    control={
                        <Switch color='primary'/>
                    } 
                />
            </Grid>
            <Grid item container md={12} spacing={3}>
                <Grid item>
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name="startDate"
                        control={control}
                        autoOk
                        variant="inline"
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
                <FormControlLabel 
                    name='isExam'
                    inputRef={register()} 
                    label={isExam ? 'This is a Exam Topic' : 'This is an Homework Topic'} 
                    labelPlacement='end' 
                    control={
                        <Switch color='primary'/>
                    } 
                />
            </Grid>
        </Grid>
    );
};

export default CommonSettings;