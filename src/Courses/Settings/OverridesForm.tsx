import { Grid, TextField } from '@material-ui/core';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import MomentUtils from '@date-io/moment';
import moment from 'moment';

type Inputs = {
  example: string,
  exampleRequired: string,
};

interface OverridesFormProps {

}

export const OverridesForm: React.FC<OverridesFormProps> = ({}) => {
    const { register, handleSubmit, watch, errors, control } = useForm<Inputs>();
    const onSubmit = (data: any) => console.log(data);
  
    console.log(watch('startDate')); // watch input value by passing the name of it
  
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
            
                <input type="submit" />
            </Grid>
        </form>
    );
};

export default OverridesForm;