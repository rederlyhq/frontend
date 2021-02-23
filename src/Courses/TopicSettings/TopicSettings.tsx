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
import emptyRTDF from './EmptyRTDF.json';
import { PromptUnsaved } from '../../Components/PromptUnsaved';

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
    const { register, handleSubmit, control, watch, reset, formState } = topicForm;
    const [{ message: updateAlertMsg, severity: updateAlertType }, setUpdateAlert] = useMUIAlertState();
    // This is a hack to allow us to update the selected TopicObject with DEF file information but not
    // lose all the user input that might be in the form.
    const [oldSelectedState, setOldSelectedState] = useState<TopicObject>(selected);
    const [saving, setSaving] = useState<boolean>(false);
    const {updateBreadcrumbLookup} = useBreadcrumbLookupContext();

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
            updateBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: newTopic.name ?? 'Unnamed Topic'});
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
                    {selected.hasEverBeenActive() && selected.isExam() && 
                        <MUIAlert severity='warning' variant='standard'>
                            This Assessment is currently available to students. 
                            Any changes to an active exam can distort scores for students who have already taken or are taking the exam, 
                            so please make sure you are comfortable with this before you confirm this change.
                        </MUIAlert>
                    }
                    <CommonSettings
                        formObject={topicForm}
                        setUpdateAlert={setUpdateAlert}
                        downloadDefFileClick={() => {
                            // TODO share this function with backend
                            // TODO share this constant with backend
                            const webworkDateFormat = 'MM/DD/YYYY [at] hh:mma';
                            const isExam = selected.topicTypeId === 2;
                            let fileContent = `
                            assignmentType = ${isExam ? 'gateway' : 'default'}

                            # Dates don't have timezones due to limitations
                            openDate = ${selected.startDate.toMoment().format(webworkDateFormat)}
                            dueDate = ${selected.endDate.toMoment().format(webworkDateFormat)}
                            reducedScoringDate = ${selected.deadDate.toMoment().format(webworkDateFormat)}

                            answerDate = ${selected.deadDate.toMoment().format(webworkDateFormat)}
                            enableReducedScoring = ${selected.partialExtend ? 'Y' : 'N'}

                            # Not supported
                            paperHeaderFile   = 
                            # Not supported
                            screenHeaderFile  = 

                            ${(isExam && _.isSomething(selected.topicAssessmentInfo)) ? `
                            attemptsPerVersion  = ${selected.topicAssessmentInfo.maxGradedAttemptsPerVersion}
                            timeInterval        = ${(selected.topicAssessmentInfo.versionDelay ?? 0) * 60}
                            versionsPerInterval = ${selected.topicAssessmentInfo.maxVersions}
                            versionTimeLimit    = ${selected.topicAssessmentInfo.duration}
                            problemRandOrder    = ${Number(selected.topicAssessmentInfo.randomizeOrder)}
                            # Not supported
                            problemsPerPage     = 0
                            hideScore           = ${selected.topicAssessmentInfo.showTotalGradeImmediately ? 'N': 'Y'}
                            hideScoreByProblem  = ${selected.topicAssessmentInfo.showItemizedResults ? 'N' : 'Y'}
                            hideWork            = ${selected.topicAssessmentInfo.hideProblemsAfterFinish ? 'Y' : 'N'}
                            capTimeLimit        = ${Number(selected.topicAssessmentInfo.hardCutoff)}
                            ` : ''}
                            
                            # Not supported
                            description       = 
                            # Not supported
                            restrictProbProgression = 0
                            # Not supported
                            emailInstructor   = 0

                            problemListV2
                            `;
                            selected.questions.forEach((question) => {
                                fileContent += `
                                problem_start
                                problem_id = ${question.id}
                                source_file = ${question.webworkQuestionPath}
                                value = ${question.weight}
                                max_attempts = ${question.maxAttempts}
                                # showMeAnother in webwork is number of attempts before but rederly does not support that
                                showMeAnother = -1
                                # Not supported
                                prPeriod = -1
                                # Not supported
                                counts_parent_grade = 0
                                # Not supported
                                att_to_open_children = 0
                                ${(isExam && _.isSomething(question.courseQuestionAssessmentInfo)) ? `
                                rederlyAdditionalPaths = ${JSON.stringify(question.courseQuestionAssessmentInfo.additionalProblemPaths)}
                                rederlyRandomSeedRestrictions = ${JSON.stringify(question.courseQuestionAssessmentInfo.randomSeedSet)}
                                ` : '' }
                                problem_end
                                `;
                            });

                            fileContent = fileContent.replace(/^\s*/gm, '').replace('problemListV2', '\nproblemListV2');

                            const defBlob = new Blob([fileContent], {type: 'text/plain;charset=utf-8'});
                            saveAs(defBlob, `${selected.name}.rdef`);
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