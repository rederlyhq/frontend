import { Grid, TextField, Button } from '@material-ui/core';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import MomentUtils from '@date-io/moment';
import moment, { Moment } from 'moment';
import { extendTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';

type Inputs = {
    startDate: Moment;
    endDate: Moment;
    deadDate: Moment;
};

interface OverridesFormProps {
    courseTopicContentId: number;
    userId: number;
}

export const OverridesForm: React.FC<OverridesFormProps> = ({courseTopicContentId, userId}) => {
    const { register, handleSubmit, watch, errors, control } = useForm<Inputs>();

    const onSubmit = async (extensions: {startDate: Moment, endDate: Moment, deadDate: Moment}) => {
        console.log(extensions);
        try {
            const res = await extendTopic({courseTopicContentId, userId, extensions});
            console.log(res)
        } catch (e) {
            console.error(e);
        }
    };
  
    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{width: '100%'}}>
            <Grid container>
                {/* <Grid item>
                    <TextField inputRef={register} name="Max Attempt"/>
                </Grid> */}

                <Grid item md={4}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Controller
                            as={<KeyboardDatePicker value="" onChange={() => {}} />}
                            name="startDate"
                            control={control}
                            defaultValue={moment()}
                            autoOk
                            variant="inline"
                            format="MM/DD/yyyy"
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                            fullWidth={true}
                            InputLabelProps={{ shrink: false, color: 'rgba(255, 255, 255, 0.8)' }}
                            inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)' } }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>

                <Grid item md={4}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Controller
                            as={<KeyboardDatePicker value="" onChange={() => {}} />}
                            name="endDate"
                            control={control}
                            defaultValue={moment()}
                            autoOk
                            variant="inline"
                            format="MM/DD/yyyy"
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                            fullWidth={true}
                            InputLabelProps={{ shrink: false, color: 'rgba(255, 255, 255, 0.8)' }}
                            inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)' } }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
            
                <Grid item md={4}>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Controller
                            as={<KeyboardDatePicker value="" onChange={() => {}} />}
                            name="deadDate"
                            control={control}
                            defaultValue={moment()}
                            autoOk
                            variant="inline"
                            format="MM/DD/yyyy"
                            KeyboardButtonProps={{
                                'aria-label': 'change date',
                            }}
                            fullWidth={true}
                            InputLabelProps={{ shrink: false, color: 'rgba(255, 255, 255, 0.8)' }}
                            inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)' } }}
                        />
                    </MuiPickersUtilsProvider>
                </Grid>
            
                <Button type="submit">Confirm Extension</Button>
            </Grid>
        </form>
    );
};

export default OverridesForm;