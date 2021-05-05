import { Grid, Button, Snackbar, CircularProgress } from '@material-ui/core';
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
import emptyRTDF from './EmptyRTDF.json';
import { HasEverBeenActiveWarning } from './HasEverBeenActiveWarning';
import { PromptUnsaved } from '../../Components/PromptUnsaved';
import { getDefObjectFromTopic } from '@rederly/rederly-utils';
import { isKeyOf } from '../../Utilities/TypescriptUtils';
import { DevTool } from '@hookform/devtools';
import { RegradeTopicButton } from './RegradeTopicButton';
import { ConfirmationModal, ConfirmationModalProps } from '../../Components/ConfirmationModal';

interface TopicSettingsProps {
    selected: TopicObject;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    regrade: () => unknown;
    fetchTopic: () => Promise<void>;
}

export const TopicSettings: React.FC<TopicSettingsProps> = ({selected, setTopic, regrade, fetchTopic}) => {
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
    const { register, handleSubmit, control, watch, reset, formState } = topicForm;
    const [{ message: updateAlertMsg, severity: updateAlertType }, setUpdateAlert] = useMUIAlertState();
    // This is a hack to allow us to update the selected TopicObject with DEF file information but not
    // lose all the user input that might be in the form.
    const [oldSelectedState, setOldSelectedState] = useState<TopicObject | null>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const {updateBreadcrumbLookup} = useBreadcrumbLookupContext();

    const DEFAULT_CONFIRMATION_PARAMETERS: ConfirmationModalProps = {
        show: false,
        onConfirm: () => { logger.error('onConfirm not set'); },
        onHide: () => setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS),
        headerContent: 'Do you want to regrade this topic?',
        bodyContent: <div>
            <p>Due to some of the edits made to this topic some student&apos;s grade&apos;s should change.</p>
            <p>During regrade the topic will not be available to students or for updates.</p>
            <p>This should only take a few minutes.</p>
        </div>
    };

    const [confirmationParameters, setConfirmationParameters] = useState<ConfirmationModalProps>(DEFAULT_CONFIRMATION_PARAMETERS);
    

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
            
            const res = await putTopic({
                id: selected.id,
                data: obj
            });
            const topicData = res.data.data.updatesResult.first;

            if ((topicData?.gradeIdsThatNeedRetro?.length ?? 0) > 0) {
                setConfirmationParameters(current => ({
                    ...current,
                    show: true
                }));
            }

            setUpdateAlert({message: 'Successfully updated', severity: 'success'});

            // Overwrite fields from the original object. This resets the state object when clicking between options.
            setTopic(currentTopic => new TopicObject({
                ...topicData,
                // didn't fetch questions again
                questions: currentTopic?.questions,
                topicAssessmentInfo: currentTopic?.topicAssessmentInfo
            }));
            updateBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: topicData?.name ?? 'Unnamed Topic'});
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
            <PromptUnsaved message='You have unsaved changes. Are you sure you want to leave the page?' when={formState.isDirty} />
            <form
                onChange={() => {if (updateAlertMsg !== '') setUpdateAlert({message: '', severity: 'warning'});}}
                onSubmit={handleSubmit(onSubmit)}
            >
                <DevTool control={control} />
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
                    <HasEverBeenActiveWarning topic={selected} />
                    <CommonSettings
                        formObject={topicForm}
                        setUpdateAlert={setUpdateAlert}
                        topicId={selected.id}
                        downloadDefFileClick={() => {
                            try {
                                // TODO fix typing higher up
                                const tempTopic = {...selected};
                                ['startDate', 'endDate', 'deadDate'].forEach(key => {
                                    if(isKeyOf(key, tempTopic)) {
                                        const dateCandidate: unknown = tempTopic[key];
                                        if (moment.isMoment(dateCandidate)) {
                                            (tempTopic[key] as any) = dateCandidate.toDate();
                                        } else if(typeof tempTopic[key] === 'string') {
                                            (tempTopic[key] as any) = new Date(dateCandidate as string);
                                        }    
                                    }
                                });

                                const webworkdef = getDefObjectFromTopic(tempTopic);
                                const fileContent = webworkdef.dumpAsDefFileContent();
                                const defBlob = new Blob([fileContent], {type: 'text/plain;charset=utf-8'});
                                saveAs(defBlob, `${selected.name}.rdef`);
                            } catch (e) {
                                setUpdateAlert({message: 'Could not export Rederly-DEF file', severity: 'error'});
                                logger.error('Could not export Rederly-DEF file', e);
                            }
                        }}
                        exportTopicClick={() => {
                            const deepKeys = _.deepKeys(emptyRTDF);
                            const adjustedKeys = _.removeArrayIndexesFromDeepKeys(deepKeys);
                            const result = _.pickWithArrays(selected, ...adjustedKeys) as Partial<typeof emptyRTDF>;
                            const rtdfBlob = new Blob([JSON.stringify(result, null, 2)], {type: 'text/plain;charset=utf-8'});
                            saveAs(rtdfBlob, `${selected.name}.rtdf`);
                        }}
                    />
                    {topicTypeId === TopicTypeId.EXAM && <ExamSettings register={register} control={control} watch={watch} />}
                    <Grid container item md={12} alignItems='flex-start' justify="flex-end">
                        <ConfirmationModal
                            {...confirmationParameters}
                            onConfirm={() => {
                                regrade();
                                setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                            }}
                            onHide={() => {
                                setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                            }}
                        />
                        
                        <RegradeTopicButton
                            topic={selected}
                            saving={saving}
                            style={{
                                marginRight: '1em',
                            }}
                            setTopic={setTopic}
                            onRegradeClick={() => setConfirmationParameters(current => ({
                                ...current,
                                show: true
                            }))}
                            fetchTopic={fetchTopic}
                        />

                        <Button
                            color='primary'
                            variant='contained'
                            type='submit'
                            disabled={saving || selected.retroStartedTime !== null}
                        >
                            Save Topic Settings
                            { saving && <CircularProgress size={24} style={{marginLeft: '1em'}} /> }
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </FormProvider>
    );
};

export default TopicSettings;