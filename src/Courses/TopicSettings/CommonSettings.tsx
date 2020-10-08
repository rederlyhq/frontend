import MomentUtils from '@date-io/moment';
import { FormControlLabel, Grid, Switch, TextField } from '@material-ui/core';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import moment, { Moment } from 'moment';
import React from 'react';
import { Controller } from 'react-hook-form';

interface CommonSettingsProps {
    // This is the register function from react-hook-forms.
    register: any;
    control: any;
    watch: any;
}

/**
 * This component renders settings that are common to all Topic objects.
 * 
 */
export const CommonSettings: React.FC<CommonSettingsProps> = ({register, control, watch}) => {
    const { isExam } = watch();
    return (
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h1 style={{margin: '0 auto'}}>Core Topic Settings</h1></Grid>
            <Grid item md={12}>
                <TextField 
                    fullWidth 
                    name='name' 
                    inputRef={register()} 
                    label='Topic Title' 
                    InputLabelProps={{style: {fontSize: '1.2em'}}} 
                    inputProps={{style: {textAlign: 'center', fontSize: '1.6em'}}} 
                />
            </Grid>
            <Grid item container md={12} alignItems='center'>
                <Grid item container md={4}>
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name="startDate"
                        control={control}
                        autoOk
                        variant="inline"
                        fullWidth={false}
                        label='Start Date'
                        style={{margin: '0 auto'}}
                        inputProps={{style: {textAlign: 'center'}}}
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
                <Grid item container md={4}>
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name="endDate"
                        control={control}
                        autoOk
                        variant="inline"
                        fullWidth={false}
                        label='End Date'
                        style={{margin: '0 auto'}}
                        inputProps={{style: {textAlign: 'center'}}}
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
                <Grid item container md={4}>
                    <Controller
                        as={<DateTimePicker value="" onChange={() => {}} />}
                        name="deadDate"
                        control={control}
                        autoOk
                        variant='inline'
                        fullWidth={false}
                        label='Dead Date'
                        style={{margin: '0 auto'}}
                        inputProps={{style: {textAlign: 'center'}}}
                        // TextFieldComponent={<TextField style={{textAlign: 'center'}} />}
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
            </Grid>
            <Grid container item md={12}>
                <FormControlLabel 
                    name='isExam' 
                    style={{margin: '0 auto'}}
                    inputRef={register()} 
                    label={isExam ? 'This is a Exam Topic' : 'This is an Homework Topic'} 
                    labelPlacement='start' 
                    control={
                        <Switch color='primary'/>
                    } 
                />
            </Grid>
        </Grid>
    );
};

export default CommonSettings;