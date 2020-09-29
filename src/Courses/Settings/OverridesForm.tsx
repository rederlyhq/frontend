import { Grid, TextField, Button } from '@material-ui/core';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import MomentUtils from '@date-io/moment';
import moment, { Moment } from 'moment';
import { extendTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';

type Inputs = {
    startDate: Moment;
    endDate: Moment;
    deadDate: Moment;
};

interface OverridesFormProps {
    userId: number;
    courseTopicContentId?: number;
}

export const OverridesForm: React.FC<OverridesFormProps> = ({courseTopicContentId, userId}) => {
    const { register, handleSubmit, watch, errors, control } = useForm<Inputs>();
    const drawerFontSize = '1.4em';

    const updateTopic = async (courseTopicContentId: number, userId: number, extensions: {startDate: Moment, endDate: Moment, deadDate: Moment}) => {
        try {
            const res = await extendTopic({courseTopicContentId, userId, extensions});
            console.log(res);
        } catch (e) {
            console.error(e);
            throw e;
        }
    };

    const onSubmit = async (extensions: {startDate: Moment, endDate: Moment, deadDate: Moment}) => {
        console.log(extensions);
        if (!_.isNil(courseTopicContentId)) {
            updateTopic(courseTopicContentId, userId, extensions);
        }
    };
  
    return (
        <form onSubmit={handleSubmit(onSubmit)} style={{width: '100%', marginTop: '1.5rem'}}>
            <Grid container justify='center'>
                <Grid container item md={6} spacing={2}>
                    {/* <Grid item>
                        <TextField inputRef={register} name="Max Attempt"/>
                    </Grid> */}
    
                    <Grid item md={12}>
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
                                label='Start Date'
                                InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                                inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
    
                    <Grid item md={12}>
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
                                label='End Date'
                                InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                                inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                                // minDate={}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                
                    <Grid item md={12}>
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
                                label='Dead Date'
                                InputLabelProps={{style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize }}}
                                inputProps={{ style: { textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: drawerFontSize } }}
                                // minDate={}
                            />
                        </MuiPickersUtilsProvider>
                    </Grid>
                    
                    <Grid container item md={12} alignItems='flex-start' justify="flex-end" >
                        <Grid item>
                            <Button variant="contained" color='primary' type="submit" style={{fontSize: '1.2em'}}>Confirm Extension</Button>
                        </Grid>
                    
                    </Grid>
                </Grid>
            </Grid>
        </form>
    );
};

export default OverridesForm;