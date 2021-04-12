import { Grid, Snackbar } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { ProblemObject, TopicObject, ExamSettingsFields, ExamProblemSettingsFields, TopicTypeId as TopicTypeIdNumber } from '../CourseInterfaces';
import TopicSettingsSidebar from './TopicSettingsSidebar';
import { useCourseContext } from '../CourseProvider';
import { useParams, useHistory } from 'react-router-dom';
import _ from 'lodash';
import SettingsForm from './SettingsForm';
import { getTopic, postDefFile, postQuestion, putQuestion, putTopic } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { Moment } from 'moment';
import { TopicTypeId } from '../../Enums/TopicType';
import { useDropzone } from 'react-dropzone';
import logger from '../../Utilities/Logger';
import { useQuery } from '../../Hooks/UseQuery';
import { NamedBreadcrumbs, useBreadcrumbLookupContext } from '../../Contexts/BreadcrumbContext';
import WebWorkDef from '@rederly/webwork-def-parser';
import { readFileAsText } from '../../Utilities/FileHelper';
import { ConfirmationModal } from '../../Components/ConfirmationModal';
import { getTopicSettingsFromDefFile, DefFileTopicAssessmentInfo } from '@rederly/rederly-utils';
import { isKeyOf } from '../../Utilities/TypescriptUtils';
import { useMUIAlertState } from '../../Hooks/useAlertState';
import { Alert as MUIAlert } from '@material-ui/lab';
import BackendAPIError from '../../APIInterfaces/BackendAPI/BackendAPIError';
import { QuillReadonlyDisplay } from '../../Components/Quill/QuillReadonlyDisplay';

interface TopicSettingsPageProps {
    topic?: TopicObject;
}

export interface TopicSettingsInputs extends ExamSettingsFields {
    name?: string;
    description?: any;
    startDate?: Moment;
    endDate?: Moment;
    deadDate?: Moment;
    topicTypeId?: TopicTypeId;
    partialExtend?: boolean;
}

export interface ProblemSettingsInputs extends ExamProblemSettingsFields {
    webworkQuestionPath?: string;
    maxAttempts?: number;
    weight?: number;
    optional?: boolean;
    smaEnabled?: boolean;
    additionalProblemPaths?: Array<{path: string}>;
}

interface TopicSettingsOverwriteModalOptions {
    examSettings: DefFileTopicAssessmentInfo;
    topicId: number;
    description: unknown;
    topicTypeId: number;
}

const settingOptionMap = {
    'duration': 'Time Limit (minutes)',
    'hardCutoff': 'Hard Cut-off',

    'maxVersions': 'Available Versions',
    'maxGradedAttemptsPerVersion': 'Submissions per Version',
    'versionDelay': 'Delay Between Versions (minutes)',
    'randomizeOrder': 'Randomize Problem Order',

    'showItemizedResults': 'Show Problem Scores On Submission',
    'showTotalGradeImmediately': 'Show Total Score on Submission',
    'hideProblemsAfterFinish': 'Hide Problems from Student on Completition',

    'hideHints': 'Hide Hints',
};

const topicSettingToString = (value: any) => {
    if (_.isNil(value)) {
        return '';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    return value.toString();
};

const translateTopicSettings = (examSettings: any): {[key: string]: string} => {
    if (_.isNil(examSettings)) {
        return {};
    }
    return Object.keys(settingOptionMap).reduce((result: any, key: string) => {
        if (isKeyOf(key, settingOptionMap) && isKeyOf(key, examSettings)) {
            result[settingOptionMap[key]] = topicSettingToString(examSettings[key]);
        }
        return result;
    }, {});
};

interface TryJSONParseOptions {
    value: string | null | undefined;
    identifier: string;
    logValueWithError?: boolean;
}

const tryJSONParse = ({value, identifier, logValueWithError=true}: TryJSONParseOptions): object | null => {
    if (_.isNil(value) || _.isEmpty(value)) {
        return null;
    }
    try {
        return JSON.parse(value);
    } catch (e) {
        // This doesn't have sensitive info but if 
        logger.error(`Could not parse "${identifier}"${logValueWithError ? ` with value "${value}"` : ''}`, e);
    }
    return null;
};

export const TopicSettingsPage: React.FC<TopicSettingsPageProps> = ({topic: topicProp}) => {
    const [ updateAlert, setUpdateAlert] = useMUIAlertState();
    const [topicSettingsOverwriteModalOptions, setTopicSettingsOverwriteModalOptions] = useState<TopicSettingsOverwriteModalOptions | null>(null);
    const [selected, setSelected] = useState<ProblemObject | TopicObject>(new TopicObject());
    const [topic, setTopic] = useState<TopicObject | null>(null);
    const {course} = useCourseContext();
    const { topicId: topicIdStr } = useParams<{topicId?: string}>();
    const topicId = topicProp?.id || (topicIdStr ? parseInt(topicIdStr, 10) : null);
    const queryParams = useQuery();
    const {updateBreadcrumbLookup} = useBreadcrumbLookupContext();
    const history = useHistory();

    useEffect(()=>{
        if (!topicId) {
            logger.error('No topicId!', window.location);
            return;
        }

        (async ()=>{
            try {
                const res = await getTopic({id: topicId, includeQuestions: true});
                const topicData = res.data.data;
                setTopic(new TopicObject(topicData));
                updateBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: topicData.name ?? 'Unnamed Topic'});
                setSelected(new TopicObject(topicData));
            } catch (e) {
                logger.error('Failed to load Topic', e);
                setUpdateAlert({message: e.message, severity: 'error'});
            }
        })();
    }, [course]);

    // Sets the selected state when the topic is loaded to the problemId in the URL.
    useEffect(()=>{
        const problemIdStr = queryParams.get('problemId');
        if (!_.isNil(problemIdStr)) {
            const problemId = parseInt(problemIdStr, 10);
            setSelected(selected => {
                return _.find(topic?.questions, ['id', problemId]) ?? selected;
            });
        }
    }, [topic, queryParams]);

    const addNewProblem = async () => {
        if (_.isNil(topicId) || _.isNil(topic)) {
            logger.error('Tried to add a new problem with no topicId');
            return;
        }

        try {
            const result = await postQuestion({
                data: {
                    courseTopicContentId: topicId
                }
            });

            const newProb = new ProblemObject(result.data.data);
            const newTopic = new TopicObject(topic);
            newTopic.questions.push(newProb);

            setTopic(newTopic);
            // Name should never be updated here, so no need to cache.
            history.push(`?problemId=${newProb.id}`);
            // updateBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: newTopic.name ?? 'Unnamed Topic'});
        } catch (e) {
            logger.error('Failed to create a new problem with default settings.', e);
            setUpdateAlert({message: e.message, severity: 'error'});
        }
    };

    const handleDrag = async (result: any) => {
        try {
            if (!topic) {
                logger.error('Received a drag event on a null topic.', result);
                return;
            }

            if (!result.destination) {
                return;
            }

            if (result.destination.index === result.source.index) {
                return;
            }

            const newContentOrder: number = result.destination.index + 1;
            const problemIdRegex = /^problemRow(\d+)$/;
            const { draggableId: problemDraggableId } = result;
            // If exec doesn't match the result will be null
            // If it does succeed the index `1` will always be the group above
            const problemIdStr = problemIdRegex.exec(problemDraggableId)?.[1];
            if(_.isNil(problemIdStr)) {
                logger.error('problem not found could not update backend');
                return;
            }
            const problemId = parseInt(problemIdStr, 10);

            const newTopic = new TopicObject(topic);
            const existingProblem = _.find(newTopic.questions, ['id', problemId]);

            if(_.isNil(existingProblem)) {
                logger.error('existing problem not found could not update frontend');
                return;
            }

            existingProblem.problemNumber = newContentOrder;
            const [removed] = newTopic.questions.splice(result.source.index, 1);
            newTopic.questions.splice(result.destination.index, 0, removed);

            const response = await putQuestion({
                id: problemId,
                data: {
                    problemNumber: newContentOrder,
                },
            });

            response.data.data.updatesResult.forEach((returnedProblem: Partial<ProblemObject>) => {
                const existingProblem = _.find(newTopic.questions, ['id', returnedProblem.id]);
                Object.assign(existingProblem, returnedProblem);
            });

            setTopic(newTopic);
            setSelected(selected => selected instanceof ProblemObject ? new ProblemObject({...selected}) : selected);
            // Name should never be updated here, so no need to cache.
            // updateBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: newTopic.name ?? 'Unnamed Topic'});
        } catch (e) {
            logger.error('Drag/Drop error:', e);
            setUpdateAlert({message: e.message, severity: 'error'});
        }
    };

    const pushDefFile = async ({
        topicId,
        defFile,
    } : {
        topicId: number;
        defFile: File;
    }) => {
        if (_.isNil(topic)) {
            throw new Error('Topic disappeared before pushing the def file');
        }
        const res = await postDefFile({
            defFile: defFile,
            courseTopicId: topicId,
        });
        const newProblems = [
            ...topic.questions,
            ...res.data.data.newQuestions.map((question: ProblemObject) => new ProblemObject(question))
        ];
        const newTopic = new TopicObject(topic);
        newTopic.questions = newProblems;
        setTopic(newTopic);
        // Name should never be updated here, so no need to cache.
        // updateBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: newTopic.name ?? 'Unnamed Topic'});    
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        (async () => {
            try {
                // setError(null);
                if (_.isNil(topic)) {
                    logger.error('existing topic is nil');
                    throw new Error('Cannot find topic you are trying to add questions to');
                }

                const defFile = acceptedFiles.first;
                if(_.isNil(defFile)) {
                    throw new Error('Invalid def file');
                }

                const fileContent = await readFileAsText(defFile);
                let parsedWebworkDef:WebWorkDef | null = null;
                if (_.isSomething(fileContent)) {
                    parsedWebworkDef = new WebWorkDef(fileContent.toString());
                }

                await pushDefFile({
                    topicId: topic.id,
                    defFile,
                });
                if (_.isSomething(parsedWebworkDef)) {
                    const topicSettingsFromDefFile = getTopicSettingsFromDefFile(parsedWebworkDef);
                    if (_.isSomething(topicSettingsFromDefFile.topicAssessmentInfo) || _.isSomething(topicSettingsFromDefFile.description)) {
                        const description = tryJSONParse({
                            value: topicSettingsFromDefFile.description,
                            identifier: 'import rederly def file',
                        });

                        setTopicSettingsOverwriteModalOptions({
                            examSettings: topicSettingsFromDefFile.topicAssessmentInfo ?? {},
                            topicId: topic.id,
                            description: description,
                            topicTypeId: parsedWebworkDef.isExam() ? TopicTypeIdNumber.EXAM : TopicTypeIdNumber.PROBLEM_SET
                        });    
                    }
                }
            } catch (e) {
                setUpdateAlert({message: e.message, severity: 'error'});
            }
        })();
    }, [topic]);

    const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ onDrop,
        accept: ['.def', '.rdef'],
        noClick: true,
        noKeyboard: true
    });


    if (_.isNil(topic)) {
        return null;
    }

    return (
        <Grid container spacing={5} style={{maxWidth: '100%', marginLeft: '0px'}} {...getRootProps({refKey: 'innerRef'})}>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={updateAlert.message !== ''}
                autoHideDuration={6000}
                onClose={() => setUpdateAlert({message: '', severity: 'info'})}
                style={{ maxWidth: '50vw' }}
            >
                <MUIAlert severity={updateAlert.severity}>
                    {updateAlert.message}
                </MUIAlert>
            </Snackbar>
            <ConfirmationModal
                headerContent={<h4>Overwrite settings</h4>}
                cancelText="No"
                confirmText="Yes"
                bodyContent={<>
                    <h6>Do you want to overwrite the following settings:</h6>
                    <ul>
                        {_.isSomething(topicSettingsOverwriteModalOptions?.topicTypeId) &&
                        <li>
                            <strong>Topic Type:</strong> {topicSettingsOverwriteModalOptions?.topicTypeId === TopicTypeIdNumber.EXAM ? 'Exam' : 'Homework'}
                        </li>}
                        {Object.entries(translateTopicSettings(topicSettingsOverwriteModalOptions?.examSettings)).map((setting) => (
                            // setting is a touple where 0 is the key and 1 is the value
                            <li key={`${setting[0]}-${setting[1]}`}>
                                <strong>{setting[0]}:</strong> {setting[1]}
                            </li>
                        ))}
                        {topicSettingsOverwriteModalOptions?.description &&
                        <li>
                            <strong>Description:</strong><br/>
                            <QuillReadonlyDisplay 
                                content={topicSettingsOverwriteModalOptions.description as any}
                            />
                        </li>}
                    </ul>
                </>}
                onConfirm={async ()=>{
                    try {
                        if (_.isNil(topicSettingsOverwriteModalOptions)) {
                            throw new Error('Options were missing, could not update topic');
                        }
                        const result = await putTopic({
                            data: {
                                topicAssessmentInfo: topicSettingsOverwriteModalOptions.examSettings,
                                topicTypeId: topicSettingsOverwriteModalOptions.topicTypeId,
                                description: topicSettingsOverwriteModalOptions.description
                            },
                            id: topicSettingsOverwriteModalOptions.topicId
                        });
    
                        setTopic(currentTopic => new TopicObject({
                            ...result.data.data.updatesResult.first,
                            questions: currentTopic?.questions
                        }));
                    } catch (e) {
                        if (!BackendAPIError.isBackendAPIError(e) || ((e.status ?? Number.MAX_SAFE_INTEGER) > 400)) {
                            logger.error('Error overwriting settings', e);
                        }
                        setUpdateAlert({message: e.message, severity: 'error'});
                    } finally {
                        setTopicSettingsOverwriteModalOptions(null);
                    }
                }}
                onSecondary={() => setTopicSettingsOverwriteModalOptions(null)}
                onHide={() => setTopicSettingsOverwriteModalOptions(null)}
                show={_.isSomething(topicSettingsOverwriteModalOptions)}
            />
            {/* Sidebar */}
            <TopicSettingsSidebar
                topic={topic || new TopicObject()}
                selected={selected}
                setSelected={setSelected}
                addNewProblem={addNewProblem}
                handleDrag={handleDrag}
                isDragActive={isDragActive}
                getInputProps={getInputProps}
                open={open}
            />
            {/* Problem List */}
            <SettingsForm
                selected={selected}
                setSelected={setSelected}
                setTopic={setTopic}
                topic={topic}
            />
        </Grid>
    );
};

export default TopicSettingsPage;