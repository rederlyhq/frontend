import { Grid, Button } from '@material-ui/core';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TopicTypeId } from '../../Enums/TopicType';
import { TopicObject } from '../CourseInterfaces';
import CommonSettings from './CommonSettings';
import ExamSettings from './ExamSettings';
import { TopicSettingsInputs } from './TopicSettingsPage';
import { putTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';
import { DevTool } from '@hookform/devtools';
import { Alert } from 'react-bootstrap';
import useAlertState from '../../Hooks/useAlertState';

interface TopicSettingsProps {
    selected: TopicObject;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
}

export const TopicSettings: React.FC<TopicSettingsProps> = ({selected, setTopic}) => {
    const topicForm = useForm<TopicSettingsInputs>({
        mode: 'onSubmit', 
        shouldFocusError: true,
        defaultValues: {
            ...selected,
            startDate: moment(selected.startDate),
            endDate: moment(selected.endDate),
            deadDate: moment(selected.deadDate),
            // TODO: Fix duplicate enum
            topicTypeId: (selected.topicTypeId === 1) ? TopicTypeId.HOMEWORK : TopicTypeId.EXAM,
        }
    });
    const { register, handleSubmit, getValues, errors, control, setValue, watch, formState, reset } = topicForm;
    const [{ message: updateAlertMsg, variant: updateAlertType }, setUpdateAlert] = useAlertState();

    useEffect(()=>{
        reset({
            ...selected,
            startDate: moment(selected.startDate),
            endDate: moment(selected.endDate),
            deadDate: moment(selected.deadDate),
            // TODO: Fix duplicate enum
            topicTypeId: (selected.topicTypeId === 1) ? TopicTypeId.HOMEWORK : TopicTypeId.EXAM,
        });
        console.log(selected);
    }, [selected]);

    const onSubmit = async (data: TopicSettingsInputs, event: any) => {
        console.log(data);
        if (_.isNil(selected)) {
            console.error('Tried to submit while topic was blank!');
            return;
        }

        const obj: any = {...data};

        // TODO: Make a getter
        obj.topicTypeId = data.topicTypeId === TopicTypeId.HOMEWORK ? 1 : 2;
        
        try {
            const res = await putTopic({
                id: selected.id,
                data: obj
            });

            console.log(res);
            setUpdateAlert({message: 'Successfully updated', variant: 'success'});

            // Overwrite fields from the original object. This resets the state object when clicking between options.
            setTopic(new TopicObject({...selected, ...obj}));
        } catch (e) {
            console.error('Error updating topic.', e);
            setUpdateAlert({message: e.message, variant: 'danger'});
        }
    };

    const { topicTypeId } = watch();

    return (
        <form onChange={() => {setUpdateAlert({message: '', variant: 'warning'});}} onSubmit={handleSubmit(onSubmit)}>
            {/* <DevTool control={control} /> */}
            <Grid container item md={12} spacing={3}>
                {(updateAlertMsg !== '') && <Grid md={12} item><Alert variant={updateAlertType}>{updateAlertMsg}</Alert></Grid>}
                <CommonSettings formObject={topicForm} />
                {topicTypeId === TopicTypeId.EXAM && <ExamSettings register={register} control={control} watch={watch} />}
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
        </form>
    );
};

export default TopicSettings;