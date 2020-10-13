import React, { useEffect } from 'react';
import { Button, Grid } from '@material-ui/core';
import { OptionalField, ProblemMaxAttempts, ProblemPath, ProblemWeight } from './GenericFormInputs';
import { Link } from 'react-router-dom';
import { ProblemObject, TopicObject } from '../CourseInterfaces';
import { ProblemSettingsInputs } from './TopicSettingsPage';
import { useForm } from 'react-hook-form';
import { putQuestion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';
import useAlertState from '../../Hooks/useAlertState';
import { Alert } from 'react-bootstrap';

interface ProblemSettingsProps {
    selected: ProblemObject;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
}

export const ProblemSettings: React.FC<ProblemSettingsProps> = ({selected, setTopic, topic}) => {
    const topicForm = useForm<ProblemSettingsInputs>({
        mode: 'onSubmit', 
        shouldFocusError: true,
        defaultValues: {
            ...selected,
        }
    });
    const { register, handleSubmit, getValues, errors, control, setValue, watch, formState, reset } = topicForm;
    const { optional } = watch();
    const [{ message: updateAlertMsg, variant: updateAlertType }, setUpdateAlert] = useAlertState();

    useEffect(()=>{
        reset({
            ...selected,
        });
        setUpdateAlert({message: '', variant: 'warning'});
    }, [selected]);

    const onSubmit = async (data: ProblemSettingsInputs, e: any) => {
        if (_.isNil(selected)) {
            console.error('Tried to submit while problem was blank!');
            return;
        }

        try {
            const res = await putQuestion({
                id: selected.id,
                data
            });

            console.log(res);
            setUpdateAlert({message: 'Successfully updated', variant: 'success'});

            // Overwrite fields from the original object. This resets the state object when clicking between options.
            const newTopic = new TopicObject({...topic});
            const newQuestion = _.find(newTopic.questions, ['id', selected.id]);
            _.assign(newQuestion, data);
            setTopic(newTopic);
        } catch (e) {
            console.error('Error updating topic.', e);
            setUpdateAlert({message: e.message, variant: 'danger'});
        }
    };

    return (
        <form onChange={() => {setUpdateAlert({message: '', variant: 'warning'});}} onSubmit={handleSubmit(onSubmit)}>
            <Grid container item md={12} spacing={3}>
                {(updateAlertMsg !== '') && <Grid md={12} item><Alert variant={updateAlertType}>{updateAlertMsg}</Alert></Grid>}
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
                        {OptionalField(control)}
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