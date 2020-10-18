import React, { useEffect, useState } from 'react';
import { Button, Grid } from '@material-ui/core';
import { OptionalField, ProblemMaxAttempts, ProblemPath, ProblemWeight, RandomSeedSet } from './GenericFormInputs';
import { Link } from 'react-router-dom';
import { ProblemObject, TopicObject } from '../CourseInterfaces';
import { ProblemSettingsInputs } from './TopicSettingsPage';
import { useForm } from 'react-hook-form';
import { deleteQuestion, putQuestion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';
import useAlertState from '../../Hooks/useAlertState';
import { Alert } from 'react-bootstrap';
import { ConfirmationModal } from '../../Components/ConfirmationModal';
import { DevTool } from '@hookform/devtools';

interface ProblemSettingsProps {
    selected: ProblemObject;
    // Used to reset the selected bar after a deletion occurs.
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
}

export const ProblemSettings: React.FC<ProblemSettingsProps> = ({selected, setSelected, setTopic, topic}) => {
    const topicForm = useForm<ProblemSettingsInputs>({
        mode: 'onSubmit', 
        shouldFocusError: true,
        defaultValues: {
            ...selected,
        }
    });
    const { register, handleSubmit, control, watch, reset, errors } = topicForm;
    const { optional } = watch();
    const [{ message: updateAlertMsg, variant: updateAlertType }, setUpdateAlert] = useAlertState();
    const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

    useEffect(()=>{
        reset({
            ...selected,
        });
        setUpdateAlert({message: '', variant: 'warning'});
    }, [selected]);

    const onSubmit = async (data: ProblemSettingsInputs) => {
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

    const onDelete = async () => {
        setUpdateAlert({message: '', variant: 'warning'});
        try {
            const problemId = selected.id;
            const problemNumber = selected.problemNumber;
            await deleteQuestion({
                id: problemId
            });    
            let newProblems = [...topic.questions];
            const deletedProblem = _.find(newProblems, ['id', problemId]);
            // Decrement everything after
            if (!_.isNil(deletedProblem)) {
                _.filter(newProblems, problem => problem.problemNumber > deletedProblem.problemNumber).forEach(problem => problem.problemNumber--);
            }
            newProblems = _.reject(newProblems, ['id', problemId]);
            const newTopic = new TopicObject(topic);
            newTopic.questions = newProblems;
            setTopic(newTopic);
            // If the problem we deleted was the last one, reset back to topic.
            if (newProblems.length === 0) {
                setSelected(newTopic);
            } else {
                setSelected(problemNumber < newTopic.questions.length ? newTopic.questions[problemNumber - 1] : newTopic.questions[problemNumber - 2]);
            }

            setUpdateAlert({message: 'Successfully deleted question', variant: 'success'});
        } catch (e) {
            setUpdateAlert({message: e.message, variant: 'danger'});
        }
    };

    return (
        <form onChange={() => {if (updateAlertMsg !== '') setUpdateAlert({message: '', variant: 'warning'});}} onSubmit={handleSubmit(onSubmit)}>
            <DevTool control={control} />
            <Grid container item md={12} spacing={3}>
                {(updateAlertMsg !== '') && <Grid md={12} item><Alert variant={updateAlertType}>{updateAlertMsg}</Alert></Grid>}
                {errors}
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
                    </Grid><Grid item md={12}>
                You can optionally limit the seed values used for specific problems.
                        {RandomSeedSet(control)}
                    </Grid>
                </Grid>
                <Grid container item md={12} alignItems='flex-start' justify="flex-end" >
                    <Grid container item md={4} spacing={3} justify='flex-end'>
                        <Button
                            color='secondary'
                            variant='contained'
                            onClick={()=>{setShowConfirmDelete(true);}}
                            style={{marginRight: '1em'}}
                        >
                            Delete
                        </Button>
                        <Button
                            color='primary'
                            variant='contained'
                            type='submit'
                        >
                            Save Problem
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            <ConfirmationModal
                onConfirm={() => { onDelete(); setShowConfirmDelete(false); }}
                onHide={() => {
                    setShowConfirmDelete(false);
                }}
                show={showConfirmDelete}
                headerContent={<h5>Confirm delete</h5>}
                bodyContent={`Are you sure you want to remove Problem ${selected.problemNumber}?`}
            />
        </form>
    );
};

export default ProblemSettings;