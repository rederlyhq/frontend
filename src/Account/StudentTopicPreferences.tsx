import { Button, FormControlLabel, Grid, Switch } from '@material-ui/core';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import _ from 'lodash';
import { nameof } from '../Utilities/TypescriptUtils';
import localPreferences from '../Utilities/LocalPreferences';
import useAlertState from '../Hooks/useAlertState';
import { Alert } from 'react-bootstrap';

const { topicPreferences } = localPreferences;

export interface StudentTopicPreferencesInputs {
    useSeconds: boolean;
}

interface StudentTopicPreferencesProps {

}


export const StudentTopicPreferences: React.FC<StudentTopicPreferencesProps> = () => {
    const [alert, setAlert] = useAlertState();
    const preferences = useForm<StudentTopicPreferencesInputs>({
        mode: 'onSubmit',
        shouldFocusError: true,
        defaultValues: {
            useSeconds: topicPreferences.useSeconds
        }
    });
    const { control, getValues, handleSubmit, watch } = preferences;
    const useSeconds = watch('useSeconds');

    const onSubmit = (values: StudentTopicPreferencesInputs) => {
        topicPreferences.useSeconds = values.useSeconds;
        setAlert({
            variant: 'success',
            message: 'Saved Successful'
        });
    };

    const clearAlert = () => {
        setAlert({
            variant: 'info',
            message: ''
        });
    };

    return (<Grid container item spacing={3} xs={6} justify='center'>
        <form onChange={() => clearAlert()} onSubmit={handleSubmit(onSubmit)}>
            <Alert variant={alert.variant} show={alert.message.length > 0}>{alert.message}</Alert>
            <Grid item md={12}>
                <h1>Topic Preferences</h1>
                <p>These preferences are stored locally. If you clear browser storage, switch browsers or use another computer they are subject to change.</p>
            </Grid>
            <Grid item md={12}>
                <p>
                    <strong>Use Seconds Countdown</strong>, when on, will display <em>hours:minutes:seconds</em> on the day the topic is due (example <em>Due in 5:09:04</em>). 
                    If this option is turned off, you will get a less granular countdown (examples: <em>Due in 5 minutes</em>, <em>Due in a minute</em>, <em>Due in a few seconds</em>).
                </p>
                <p>
                    <strong>It is important to note that the less granular approach rounds, so 45 seconds is &quot;Due in a minute&quot; and 44 seconds is &quot;Due in a few seconds&quot;. 90 seconds is &quot;Due in 2 minutes&quot; while 89 seconds is &quot;Due in a minute&quot;.</strong>
                </p>
                <Controller
                    name={nameof<StudentTopicPreferencesInputs>('useSeconds')}
                    control={control}
                    defaultValue={getValues().useSeconds}
                    render={({ onChange, onBlur, value, name }) => (
                        <FormControlLabel
                            name='useSeconds'
                            label={'Use Seconds Countdown'}
                            labelPlacement='start'
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
            <Grid>
                <Button
                    variant="contained"
                    color='primary'
                    type="submit"
                    style={{ fontSize: '1.2em' }}
                    disabled={_.isEqual({
                        useSeconds: topicPreferences.useSeconds
                    }, {
                        useSeconds: useSeconds
                    })}
                >
                    Save
                </Button>
            </Grid>
        </form>
    </Grid>);
};
