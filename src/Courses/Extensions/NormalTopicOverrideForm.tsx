import React from 'react';
import { TopicObject, TopicTypeId } from '../CourseInterfaces';
import _ from 'lodash';
import { Grid } from '@material-ui/core';
import { Controller, useFormContext } from 'react-hook-form';
import { DateTimePicker } from '@material-ui/pickers';
import moment, { Moment } from 'moment';

interface NormalTopicOverrideFormProps {
    topic: TopicObject;
}

export const NormalTopicOverrideForm: React.FC<NormalTopicOverrideFormProps> = ({topic}) => {
    const { control, watch, getValues, clearErrors } = useFormContext();
    const { startDate, endDate, deadDate } = watch();
    const drawerFontSize = '1.4em';

    return <>
        <Grid item md={12}>
            <Controller
                as={<DateTimePicker value="" onChange={_.noop} />}
                name="startDate"
                control={control}
                defaultValue={moment(topic.startDate)}
                autoOk
                variant="inline"
                fullWidth={true}
                label='Start'
                InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                maxDate={endDate || moment(topic.endDate)}
                rules={{
                    required: true,
                    validate: {
                        isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                        isEarliest: (startDate: Moment) => {
                            const { endDate, deadDate } = getValues();
                            return (startDate.isSameOrBefore(endDate) && startDate.isSameOrBefore(deadDate)) || topic.topicTypeId === TopicTypeId.EXAM || 'Start date cannot be after End or Dead dates';
                        }
                    }
                }}
                onAccept={() => clearErrors()}
            />
        </Grid>

        <Grid item md={12}>
            <Controller
                as={<DateTimePicker value="" onChange={_.noop} />}
                name="endDate"
                control={control}
                defaultValue={moment(topic.endDate)}
                autoOk
                variant="inline"
                fullWidth={true}
                label='End (full credit)'
                InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                minDate={startDate && moment(startDate)}
                maxDate={topic.topicTypeId === TopicTypeId.PROBLEM_SET ? (deadDate || moment(topic.deadDate)) : undefined}
                rules={{
                    required: true,
                    validate: {
                        isDate: (data: any) => moment(data).isValid() || 'Invalid date',
                    }
                }}
                onAccept={() => clearErrors()}
            />
        </Grid>

        {
            topic.topicTypeId === TopicTypeId.PROBLEM_SET &&
            <Grid item md={12}>
                <Controller
                    as={<DateTimePicker value="" onChange={_.noop} />}
                    name="deadDate"
                    control={control}
                    defaultValue={moment(topic.deadDate)}
                    autoOk
                    variant="inline"
                    fullWidth={true}
                    label='End (partial credit)'
                    InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                    inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                    minDate={endDate && moment(endDate)}
                    onAccept={() => clearErrors()}
                />
            </Grid>
        }
    </>;
};
