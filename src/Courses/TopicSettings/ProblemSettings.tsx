import React from 'react';
import { Button, Grid } from '@material-ui/core';
import { NestedFormInterface, ProblemMaxAttempts, ProblemOptional, ProblemPath, ProblemWeight } from './GenericFormInputs';
import { Link } from 'react-router-dom';
import { ProblemObject } from '../CourseInterfaces';
import { ProblemSettingsInputs } from './TopicSettingsPage';
import { useForm } from 'react-hook-form';

interface ProblemSettingsProps {
    selected: ProblemObject;
}

export const ProblemSettings: React.FC<ProblemSettingsProps> = ({selected}) => {
    const topicForm = useForm<ProblemSettingsInputs>({
        mode: 'onSubmit', 
        shouldFocusError: true,
        defaultValues: {
            ...selected,
        }
    });
    const { register, handleSubmit, getValues, errors, control, setValue, watch, formState, reset } = topicForm;
    const { optional } = watch();

    const onSubmit = (data: ProblemSettingsInputs, e: any) => {

    };

    return (
        <form onChange={() => {}} onSubmit={handleSubmit(onSubmit)}>
            <Grid container item md={12} spacing={3}>
                <Grid container item md={12} spacing={3}>
                    <Grid item container md={12}><h1>Problem Settings</h1></Grid>
                    <Grid item md={8}>
                Enter the path to the problem on the Rederly server. This is prefaced either 
                with <code>Library/</code> or <code>Contrib/</code> if this problem is included 
                in the <Link to='https://github.com/openwebwork/webwork-open-problem-library'>OPL</Link> or <code>private/</code> if 
                this problem has been uploaded to your private Rederly folder.
                        {ProblemPath(register)}
                    </Grid><Grid item md={12}>
                Enter the max attempts for a problem, or 0 or -1 for unlimited attempts.<br/>
                        {ProblemMaxAttempts(register)}
                    </Grid><Grid item md={12}>
                Enter the grading weight for this problem. Optional problems with weights will be treated as extra credit.<br/>
                        {ProblemWeight(register)}
                    </Grid><Grid item md={12}>
                This problem is {optional ? 'optional' : 'required'}.<br/>
                        {ProblemOptional(register)}
                    </Grid>
                </Grid>
                <Grid container item md={12} alignItems='flex-start' justify="flex-end" >
                    <Grid item md={3}>
                        <Button
                            color='primary'
                            variant='contained'
                            type='submit'
                        >
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </form>
    );
};

export default ProblemSettings;