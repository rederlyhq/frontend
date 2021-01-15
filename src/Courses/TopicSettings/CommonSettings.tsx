import React, { useEffect } from 'react';
import { FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Switch, TextField } from '@material-ui/core';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import moment, { Moment } from 'moment';
import { Controller } from 'react-hook-form';
import { TopicTypeId } from '../../Enums/TopicType';
import _ from 'lodash';
import { IMUIAlertModalState } from '../../Hooks/useAlertState';

interface CommonSettingsProps {
    // This is the register function from react-hook-forms.
    formObject: any;
    setUpdateAlert: React.Dispatch<React.SetStateAction<IMUIAlertModalState>>;
}

/**
 * This component renders settings that are common to all Topic objects.
 *
 */
export const CommonSettings: React.FC<CommonSettingsProps> = ({formObject, setUpdateAlert}) => {
    const { register, getValues, control, setValue, watch } = formObject;
    const { topicTypeId, partialExtend, startDate, endDate, deadDate } = watch();

    useEffect(()=>{
        if (topicTypeId === TopicTypeId.EXAM) {
            setValue('partialExtend', false);
        }
    }, [topicTypeId]);

    return (
        <Grid container item md={12} spacing={3}>
            <Grid item md={12}>
                <TextField
                    fullWidth
                    name='name'
                    inputRef={register()}
                    label='Topic Title'
                    InputLabelProps={{ shrink: true }}
                    inputProps={{style: {fontSize: '2.5rem'}}}
                />
            </Grid>
            <Grid item container md={12}><h2>Topic Settings</h2></Grid>
            {/* This is a workaround because setValue doesn't seem to cause a UI rerender. */}
            <Grid item md={12} style={{display: topicTypeId === TopicTypeId.EXAM ? 'none' : undefined}}>
                {/* ${partialCreditScore} = ((${gradeCandidate}- ${legalScore}) * ${topicLateScalar}) + ${legalScore} */}
                Set a 50% partial credit time window after the end of this topic.<br/>

                {/* <Switch color='primary' inputProps={{type: 'checkbox'}} name='partialExtend' inputRef={register()} /> */}
                <Controller
                    name='partialExtend'
                    control={control}
                    defaultValue={false}
                    render={({ onChange, onBlur, value, name }) => (
                        <FormControlLabel
                            name='partialExtend'
                            label={'Partial Credit Extension'}
                            labelPlacement='end'
                            disabled={topicTypeId === TopicTypeId.EXAM}
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
            </Grid>
            <Grid item container md={12} spacing={3}>
                <Grid item>
                    <Controller
                        as={<KeyboardDateTimePicker value="" onChange={() => {}} />}
                        name='startDate'
                        control={control}
                        autoOk
                        variant='inline'
                        inputVariant='outlined'
                        fullWidth={false}
                        label='Start'
                        maxDate={endDate}
                        maxDateMessage='Start date must come before end date'
                        onAccept={() => {setUpdateAlert({message: '', severity: 'warning'});}}
                        format="MM/DD/YYYY hh:mm A"
                        rules={{
                            required: true,
                            validate: {
                                isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                                isEarliest: (startDate: Moment) => {
                                    return startDate.isSameOrBefore(endDate) || 'Start date cannot be after End or Dead dates';
                                }
                            }
                        }}
                    />
                </Grid>
                <Grid item>
                    <Controller
                        as={<KeyboardDateTimePicker value="" onChange={() => {}} />}
                        name="endDate"
                        control={control}
                        autoOk
                        variant="inline"
                        inputVariant='outlined'
                        fullWidth={false}
                        label={partialExtend ? 'End (full credit)' : 'End'}
                        minDate={startDate}
                        minDateMessage='End date should not be set before the start date'
                        onAccept={() => {setUpdateAlert({message: '', severity: 'warning'});}}
                        format="MM/DD/YYYY hh:mm A"
                        rules={{
                            required: true,
                            validate: {
                                isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                                isBeforeStart: (endDate: Moment) => {
                                    return startDate.isSameOrBefore(endDate) || 'End date cannot be before Start date';
                                },
                                isAfterDead: (endDate: Moment) => {
                                    if (_.isNil(deadDate)) return true;
                                    return endDate.isSameOrBefore(deadDate) || 'End (full credit) date cannot be after End (partial credit) date';
                                }
                            }
                        }}
                    />
                </Grid>
                <Grid item>
                    {partialExtend &&
                    <Controller
                        as={<KeyboardDateTimePicker value="" onChange={() => {}} />}
                        name="deadDate"
                        control={control}
                        autoOk
                        variant='inline'
                        inputVariant='outlined'
                        fullWidth={false}
                        label='End (partial credit)'
                        minDate={endDate}
                        onAccept={() => {setUpdateAlert({message: '', severity: 'warning'});}}
                        format="MM/DD/YYYY hh:mm A"
                        rules={{
                            required: true,
                            validate: {
                                isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                                isLatest: (deadDate: Moment) => {
                                    const { endDate, startDate } = getValues();
                                    return startDate.isSameOrBefore(deadDate) && endDate.isSameOrBefore(deadDate) || 'End (partial credit) date cannot be before Start or End (full credit) dates';
                                }
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