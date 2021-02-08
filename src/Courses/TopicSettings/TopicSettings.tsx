import { Grid, Button, Snackbar } from '@material-ui/core';
import { Alert as MUIAlert } from '@material-ui/lab';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TopicTypeId } from '../../Enums/TopicType';
import { TopicObject, TopicAssessmentFields } from '../CourseInterfaces';
import CommonSettings from './CommonSettings';
import ExamSettings from './ExamSettings';
import { TopicSettingsInputs } from './TopicSettingsPage';
import { putTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import _ from 'lodash';
import { useMUIAlertState } from '../../Hooks/useAlertState';
import logger from '../../Utilities/Logger';
import { NamedBreadcrumbs, useBreadcrumbLookupContext } from '../../Contexts/BreadcrumbContext';

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
            ...(_.isNil(selected.topicAssessmentInfo) && {
                topicAssessmentInfo: TopicAssessmentFields.getDefaultFields(),
            }),
        }
    });
    const { register, handleSubmit, control, watch, reset } = topicForm;
    const [{ message: updateAlertMsg, severity: updateAlertType }, setUpdateAlert] = useMUIAlertState();
    // This is a hack to allow us to update the selected TopicObject with DEF file information but not
    // lose all the user input that might be in the form.
    const [oldSelectedState, setOldSelectedState] = useState<TopicObject>(selected);
    const [saving, setSaving] = useState<boolean>(false);
    const {setBreadcrumbLookup} = useBreadcrumbLookupContext();

    useEffect(()=>{
        const selectedWithoutQuestions = _.omit(selected, ['questions']);
        const stateWithoutQuestions = _.omit(oldSelectedState, ['questions']);
        if (!_.isEqual(selectedWithoutQuestions, stateWithoutQuestions)) {
            reset({
                ...selected,
                startDate: moment(selected.startDate),
                endDate: moment(selected.endDate),
                deadDate: moment(selected.deadDate),
                // TODO: Fix duplicate enum
                topicTypeId: (selected.topicTypeId === 1) ? TopicTypeId.HOMEWORK : TopicTypeId.EXAM,
                ...(_.isNil(selected.topicAssessmentInfo) && {
                    topicAssessmentInfo: TopicAssessmentFields.getDefaultFields(),
                }),
            });
        }
        setOldSelectedState(selected);
    }, [selected]);

    const onSubmit = async (data: TopicSettingsInputs) => {
        if (_.isNil(selected)) {
            logger.error('Tried to submit while topic was blank!');
            return;
        }

        const obj: any = {...data};
        obj.topicAssessmentInfo = _.pickBy(data.topicAssessmentInfo, (val) => {
            return !(_.isNil(val) || (typeof(val) === 'string' && val === ''));
        });

        // TODO: Make a getter
        obj.topicTypeId = data.topicTypeId === TopicTypeId.HOMEWORK ? 1 : 2;

        // Explicitly false
        if (data.partialExtend === false) {
            obj.deadDate = obj.endDate;
        }

        try {
            setSaving(true);
            await putTopic({
                id: selected.id,
                data: obj
            });

            setUpdateAlert({message: 'Successfully updated', severity: 'success'});

            // Overwrite fields from the original object. This resets the state object when clicking between options.
            const newTopic = new TopicObject({...selected, ...obj});
            setTopic(newTopic);
            setBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: newTopic.name ?? 'Unnamed Topic'});
        } catch (e) {
            logger.error('Error updating topic.', e);
            setUpdateAlert({message: e.message, severity: 'error'});
        } finally {
            setSaving(false);
        }
    };

    const { topicTypeId } = watch();

    return (
        <FormProvider {...topicForm}>
            <form
                onChange={() => {if (updateAlertMsg !== '') setUpdateAlert({message: '', severity: 'warning'});}}
                onSubmit={handleSubmit(onSubmit)}
            >
                {/* <DevTool control={control} /> */}
                <Grid container item md={12} spacing={3}>
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        open={updateAlertMsg !== ''}
                        autoHideDuration={updateAlertType === 'success' ? 6000 : undefined}
                        onClose={() => setUpdateAlert(alertState => ({...alertState, message: ''}))}
                        style={{maxWidth: '50vw'}}
                    >
                        <MUIAlert
                            onClose={() => setUpdateAlert(alertState => ({...alertState, message: ''}))}
                            severity={updateAlertType}
                            variant='filled'
                            style={{fontSize: '1.1em'}}
                        >
                            {updateAlertMsg}
                        </MUIAlert>
                    </Snackbar>
                    <CommonSettings formObject={topicForm} setUpdateAlert={setUpdateAlert} />
                    {topicTypeId === TopicTypeId.EXAM && <ExamSettings register={register} control={control} watch={watch} />}
                    <Grid container item md={12} alignItems='flex-start' justify="flex-end">
                        <Grid container item md={3} spacing={3} justify='flex-end'>
                            <Button
                                color='primary'
                                variant='contained'
                                type='submit'
                                disabled={saving}
                            >
                                Save Topic Settings
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </FormProvider>
    );
};

export default TopicSettings;