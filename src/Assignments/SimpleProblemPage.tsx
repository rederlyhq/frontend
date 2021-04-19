import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProblemObject, TopicObject } from '../Courses/CourseInterfaces';
import { Row, Col, Container, Nav, NavLink, Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ProblemIframe from './ProblemIframe';
import { BsCheckCircle, BsXCircle, BsSlashCircle } from 'react-icons/bs';
import { ProblemDoneState } from '../Enums/AssignmentEnums';
import _ from 'lodash';
import { askForHelp, endVersion, generateNewVersion, getQuestions, requestNewProblemVersion, submitVersion } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { ProblemDetails } from './ProblemDetails';
import { ProblemStateProvider } from '../Contexts/CurrentProblemState';
import { useCourseContext } from '../Courses/CourseProvider';
import { ConfirmationModalProps, ConfirmationModal } from '../Components/ConfirmationModal';
import moment from 'moment';
import logger from '../Utilities/Logger';
import AttachmentsSidebar from './AttachmentsSidebar';
import { getUserId } from '../Enums/UserRole';
import { Alert } from '@material-ui/lab';
import { IMUIAlertModalState, useMUIAlertState } from '../Hooks/useAlertState';
import { FaRegSave } from 'react-icons/fa';
import { NamedBreadcrumbs, useBreadcrumbLookupContext } from '../Contexts/BreadcrumbContext';
import '../Components/LayoutStyles.css';
import '../Components/LeftRightArrow.css';
import { LeftRightArrowWrapper } from '../Components/LeftRightArrowWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import useQuerystringHelper, { QueryStringMode } from '../Hooks/useQuerystringHelper';
import { SimpleProblemButtonRow } from './SimpleProblemButtonRow';

interface SimpleProblemPageProps {
}

interface SimpleProblemPageLocationParams {
    topicId?: string;
    courseId?: string;
}

// This page has two panes. The left pane renders a list of questions, and the right pane renders the currently selected question.
export const SimpleProblemPage: React.FC<SimpleProblemPageProps> = () => {
    const DEFAULT_CONFIRMATION_PARAMETERS = {
        show: false,
        onConfirm: () => { logger.error('onConfirm not set'); },
        onHide: () => setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS),
        headerContent: '',
        bodyContent: ''
    };

    const params = useParams<SimpleProblemPageLocationParams>();
    const {getCurrentQueryStrings, updateRoute} = useQuerystringHelper();
    const urlProblemIdQS = getCurrentQueryStrings()?.['problemId'];
    const urlProblemId = (typeof urlProblemIdQS === 'string') ? parseInt(urlProblemIdQS, 10) : null;
    const [problems, setProblems] = useState<Record<number, ProblemObject> | null>(null);
    const [topic, setTopic] = useState<TopicObject | null>(null);
    const [versionId, setVersionId] = useState<number | null>(null);
    const [attemptsRemaining, setAttemptsRemaining] = useState<number | 'unlimited'>(1); // the only time these two are not set
    const [versionsRemaining, setVersionsRemaining] = useState<number | 'unlimited'>(1); // is when an exam hasn't been attempted at all
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(urlProblemId);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useMUIAlertState();
    const [confirmationParameters, setConfirmationParameters] = useState<ConfirmationModalProps>(DEFAULT_CONFIRMATION_PARAMETERS);
    const [openDrawer, setOpenDrawer] = useState<boolean>(false);
    const [smaHasNoVersions, setSmaHasNoVersions] = useState<boolean>(false);
    const {course, users} = useCourseContext();
    const {updateBreadcrumbLookup} = useBreadcrumbLookupContext();
    const noAlert = useRef<IMUIAlertModalState>({severity: 'info', message: ''});

    useEffect(() => {
        setSmaHasNoVersions(false);
    }, [setSmaHasNoVersions, selectedProblemId]);

    const resetAlert = useCallback((): void => {
        setAlert(noAlert.current);
    }, [setAlert]);

    useEffect(() => {
        logger.info('SimpleProblemPage: selected problem has changed');
        resetAlert();
    }, [selectedProblemId, resetAlert]);

    useEffect(() => {
        updateRoute({
            problemId: {
                mode: QueryStringMode.OVERWRITE,
                val: selectedProblemId?.toString() ?? null,
            }
        });
    }, [selectedProblemId, updateRoute]);

    useEffect(() => {
        logger.info('SimpleProblemPage: topic or version or attempts remaining has changed');
        setLoading(true);
        resetAlert();
        (async () => {
            try {
                if (_.isNil(params.topicId)) {
                    logger.error('topicId is null');
                    throw new Error('An unexpected error has occurred');
                } else {
                    await fetchProblems(parseInt(params.topicId, 10));
                }
                setLoading(false);
            } catch (e) {
                setAlert({
                    severity: 'error',
                    message: e.message
                });
                setLoading(false);
            }
        })();
    }, [params.topicId, versionId, attemptsRemaining]);

    const fetchProblems = async (topicId: number) => {
        logger.info('SimpleProblemPage: fetching problems');
        const res = await getQuestions({
            userId: 'me',
            courseTopicContentId: topicId
        });
        const problems: Array<ProblemObject> = res.data.data.questions;

        const currentTopic = res.data.data.topic;

        // apply topic overrides: start/end/dead dates
        if (!_.isNil(currentTopic.studentTopicOverride) && !_.isEmpty(currentTopic.studentTopicOverride)) {
            const override = currentTopic.studentTopicOverride[0];
            delete override.id;
            _.assign(currentTopic, override);
        }
        // apply assessment overrides: duration, maxAttempts, maxVersions, versionDelay
        // only maxVersions is relevant -- the others are accounted for in version (studentTopicAssessmentInfo)
        if (!_.isNil(currentTopic.topicAssessmentInfo) &&
            !_.isNil(currentTopic.topicAssessmentInfo.studentTopicAssessmentOverride) &&
            !_.isEmpty(currentTopic.topicAssessmentInfo.studentTopicAssessmentOverride)
        ) {
            const override = currentTopic.topicAssessmentInfo?.studentTopicAssessmentOverride[0];
            currentTopic.topicAssessmentInfo.maxVersions =  override.maxVersions;
        }
        setTopic(currentTopic);
        updateBreadcrumbLookup?.({[NamedBreadcrumbs.TOPIC]: currentTopic.name ?? 'Unnamed Topic'});

        if (!_.isEmpty(problems)) {
            const problemDictionary = _.chain(problems)
                .map(prob => {
                    const override = prob.studentTopicQuestionOverride?.[0];
                    if (!_.isNil(override)) {
                        delete override.id;
                        _.assign(prob, override);
                    }
                    return new ProblemObject(prob);
                })
                .keyBy('id')
                .value();
            setProblems(problemDictionary);

            // If a selectedProblemId hasn't been set by the query parameter or is invalid, set it to the first id.
            if (_.isNil(selectedProblemId) || !_.some(problems, ['id', selectedProblemId])) {
                setSelectedProblemId(_.sortBy(problems, ['problemNumber']).first?.id ?? null);
            }

            if (!_.isNil(currentTopic.topicAssessmentInfo) &&
                !_.isNil(currentTopic.topicAssessmentInfo.studentTopicAssessmentInfo) &&
                currentTopic.topicAssessmentInfo.studentTopicAssessmentInfo.length > 0 // student has generated at least one version already
            ) {
                const currentVersion = _.maxBy(currentTopic.topicAssessmentInfo.studentTopicAssessmentInfo, 'startTime');
                if (!_.isNil(currentVersion) && !_.isNil(currentVersion?.numAttempts) && !_.isNil(currentVersion.maxAttempts)) {
                    // determine status from current version, don't rely on useState variables to be immediately accurate
                    const currentAttemptsRemaining = (currentVersion.maxAttempts <= 0) ? 'unlimited' : currentVersion.maxAttempts - currentVersion.numAttempts;
                    let currentVersionsRemaining = versionsRemaining;
                    if (!_.isNil(currentTopic.topicAssessmentInfo.maxVersions)) {
                        currentVersionsRemaining = (currentTopic.topicAssessmentInfo.maxVersions <= 0) ? 'unlimited' : currentTopic.topicAssessmentInfo.maxVersions - currentTopic.topicAssessmentInfo.studentTopicAssessmentInfo.length;
                        setVersionsRemaining(currentVersionsRemaining);
                    }

                    // if the assessment has been "closed" OR time has expired - do NOT allow submissions...
                    if (currentVersion.isClosed ||
                        currentVersion.endTime?.toMoment().isBefore(moment())
                    ) {
                        if (attemptsRemaining !== 0) setAttemptsRemaining(0); // avoid render loop when exam ends without having used all available attempts
                        if (currentTopic.topicAssessmentInfo.hideProblemsAfterFinish) {
                            if (currentVersionsRemaining === 'unlimited' || currentVersionsRemaining > 0) {
                                // don't automatically offer a new version if we're currently looking at
                                // our scores from the last version...
                                if (confirmationParameters.show === false) {
                                    setConfirmationParameters({
                                        show: true,
                                        onHide: () => setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS),
                                        onConfirm: () => confirmStartNewVersion(currentTopic, currentVersionsRemaining),
                                        headerContent: 'This version has expired',
                                        bodyContent: 'Would you like to start a new version of this assessment?'
                                    });
                                }
                            } else {
                                setConfirmationParameters({
                                    show: true,
                                    onHide: () => setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS),
                                    onConfirm: () => { },
                                    headerContent: 'This version has expired',
                                    bodyContent: 'You have completed all available versions of this assessment.'
                                });
                            }
                        }
                    } else {
                        setAttemptsRemaining(currentAttemptsRemaining);
                    }
                } else {
                    logger.error('Something is wrong with this assessment version. There are versions provided, but no version is "current"');
                }
                if (!_.isNil(currentVersion) && !_.isNil(currentVersion.id)) {
                    setVersionId(currentVersion.id);
                }
            }
        } else if (currentTopic.topicTypeId === 2 && !_.isNil(currentTopic.topicAssessmentInfo)) { // we are definitely an assessment - topicAssessmentInfo *should* never be missing
            const usedVersions = currentTopic.topicAssessmentInfo.studentTopicAssessmentInfo?.length ?? 0;
            let actualVersionsRemaining = versionsRemaining;

            if (!_.isNil(currentTopic.topicAssessmentInfo.maxVersions)) {
                actualVersionsRemaining = (currentTopic.topicAssessmentInfo.maxVersions <= 0) ? 'unlimited' : currentTopic.topicAssessmentInfo.maxVersions - usedVersions;
                setVersionsRemaining(actualVersionsRemaining);
            }

            if (actualVersionsRemaining === 'unlimited' || actualVersionsRemaining > 0 &&
                moment().isBetween(currentTopic.startDate.toMoment(), currentTopic.endDate.toMoment())  
            ) {
                // don't overwrite score modal on final graded submission
                if (confirmationParameters.show === false) {
                    confirmStartNewVersion(currentTopic, actualVersionsRemaining, res.data.message);
                }
            } else {
                // no problems were sent back, and user has used the maximum versions allowed
                setAlert({
                    severity: 'warning',
                    message: `${res.data.message} You have used all available versions for this assessment.`
                });
            }
        } else {
            const message = res.data.message || 'This topic does not contain any problems. Please contact your professor.';
            setAlert({
                severity: 'error',
                message
            });
        }
    };

    // This should always be used on the selectedProblem.
    const setProblemStudentGrade = (id: number, val: any) => {
        logger.info('SimpleProblemPage: setting student grade on current problem');
        resetAlert();
        if (_.isEmpty(problems) || problems === null || _.isNil(problems[id])) return;
        problems[id].grades = [val];
        setProblems({ ...problems });
    };

    const clearModal = () => {
        logger.info('SimpleProblemPage: clearing modal');
        if (modalLoading === true) return;
        setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
        setModalLoading(false);
    };

    const confirmSubmitVersion = (topicId: number, versionId: number) => {
        logger.info('SimpleProblemPage: confirming submit version');
        setConfirmationParameters({
            show: true,
            headerContent: <h5>Submit my exam</h5>,
            bodyContent: 'You are about to use one of your exam attempts. This will score all problems for this assessment. Would you like to proceed?',
            onConfirm: async () => await getResultsOfSubmission(topicId, versionId),
            onHide: clearModal,
        });
    };

    const confirmStartNewVersion = (topic: TopicObject, actualVersionsRemaining?: number | 'unlimited', message?: string) => {
        logger.info('SimpleProblemPage: confirming new version start');
        actualVersionsRemaining = actualVersionsRemaining ?? versionsRemaining; // retrieve from state if not supplied
        setConfirmationParameters({
            show: true,
            headerContent: <h5>Begin a new version</h5>,
            bodyContent: <div>
                {message} {message && <br />}
                <Alert severity='warning'>You will <u><b>not</b></u> be able to upload attachments for this version of the exam once you have started a new version.</Alert>
                {/* Should we use the term "version attempt"? */}
                You have <b>{actualVersionsRemaining}</b> {(actualVersionsRemaining === 1) ? ' version ' : ' versions '} remaining.<br />
                Are you ready to begin a new version of this assessment?
            </div>,
            onHide: clearModal,
            onConfirm: async () => await loadNewVersion(topic)
        });
    };

    const confirmEndVersion = (actualAttemptsRemaining?: number | 'unlimited') => {
        logger.info('SimpleProblemPage: confirming current version end');
        actualAttemptsRemaining = actualAttemptsRemaining ?? attemptsRemaining;
        let message = 'You have successfully completed this exam.';
        if (actualAttemptsRemaining > 0 || actualAttemptsRemaining === 'unlimited') {
            const nit = (actualAttemptsRemaining === 1) ? 'attempt' : 'attempts';
            message = `You still have ${actualAttemptsRemaining} graded ${nit} remaining. If you end the exam now, you will no longer be able to improve your score on this version. Are you sure you want to end this exam?`;
        }
        if (_.isNil(versionId)) {
            logger.error('This should never happen - ending a version without versionId set.');
        } else {
            setConfirmationParameters({
                show: true,
                headerContent: <h5>End this exam</h5>,
                bodyContent: `${message}`,
                onConfirm: async () => await endCurrentVersion(versionId),
                onHide: clearModal,
            });
        }
    };

    const getResultsOfSubmission = async (topicId: number, versionId: number) => {
        logger.info('SimpleProblemPage: getting the results of submission');
        setModalLoading(true);
        try {
            const result = await submitVersion({ topicId, versionId });
            const bodyContent = (_.isEmpty(result.data.data)) ? 'Your professor has blocked you from seeing your exam results at this time.' : generateScoreTable(result.data.data);
            const actualAttemptsRemaining = (attemptsRemaining === 'unlimited') ? attemptsRemaining : attemptsRemaining - 1;

            if (_.isNil(attemptsRemaining)) {
                logger.error('This should never happen - attemptsRemaining is still undefined.');
            } else {
                setAttemptsRemaining(actualAttemptsRemaining); //attemptsRemaining is const per render
            }
            if (_.isNil(topic)) {
                logger.error('How did we get here without a topic in state?');
            } else {
                setConfirmationParameters({
                    show: true,
                    headerContent: 'Submission Results',
                    bodyContent,
                    // buttons should be end exam / continue (+number of attempts remaining)
                    onHide: () => fetchProblems(topicId),
                    secondaryVariant: (actualAttemptsRemaining === 0) ? 'secondary' : 'danger',
                    cancelText: (actualAttemptsRemaining === 0) ? 'Close' : 'End Exam',
                    onSecondary: () => confirmEndVersion(actualAttemptsRemaining),
                    confirmVariant: 'success',
                    confirmText: (actualAttemptsRemaining === 0) ? 'New version' : 'Continue',
                    confirmDisabled: (actualAttemptsRemaining === 0 && versionsRemaining === 0) ? true : false,
                    onConfirm: (actualAttemptsRemaining === 0) ?
                        () => confirmStartNewVersion(topic) :
                        () => {
                            fetchProblems(topicId);
                            clearModal();
                        }
                });
            }
            setModalLoading(false);
            resetAlert();
        } catch (e) {
            setAlert({
                severity: 'error',
                message: e.message
            });
            clearModal();
        }
    };

    const loadNewVersion = async (topic: TopicObject) => {
        logger.info('SimpleProblemPage: loading new version');
        setModalLoading(true);
        if (_.isNil(topic)) {
            logger.error('This should not happen - no topic loaded');
        } else {
            try {
                const res = await generateNewVersion({ topicId: topic.id });
                const currentVersion = res.data.data;
                if (_.isNil(currentVersion.id)) {
                    logger.error('we tried to generate a new version, but failed.');
                } else {
                    setVersionId(currentVersion.id);
                    fetchProblems(topic.id);
                }
                clearModal();
            } catch (e) {
                const data = e.data as Partial<{
                    status: string;
                    nextAvailableStartTime: string;
                }> | undefined;
                if (data?.status === 'NOT_AVAILABLE_YET') {
                    const nextAvailableStartTime = data.nextAvailableStartTime;
                    if (_.isNil(nextAvailableStartTime)) {
                        logger.error('Could properly format version available string because response.data.nextAvailableStartTime was nil');
                        setAlert({
                            severity: 'error',
                            message: e.message
                        });
                    } else {
                        setAlert({
                            severity: 'warning',
                            message: `Another version of this assessment will be available after ${new Date(nextAvailableStartTime).toLocaleString()}.`
                        });
                    }
                } else {
                    setAlert({
                        severity: 'error',
                        message: e.message
                    });
                }
                clearModal();
            }
        }
    };

    const endCurrentVersion = async (versionId: number) => {
        logger.info('SimpleProblemPage: ending the current version');
        // const result = await endVersion({topicId, versionId});
        // if zero attemptsRemaining, we don't need to tell the backend to close
        if (!_.isNil(attemptsRemaining) && (attemptsRemaining > 0 || attemptsRemaining === 'unlimited')) {
            if (_.isNil(topic)) {
                logger.error('This should not happen - no topic loaded');
            } else {
                setModalLoading(true);
                try {
                    await endVersion({ versionId });
                    setAttemptsRemaining(0);
                    fetchProblems(topic.id); // reload the problems in case they are supposed to be hidden after close
                } catch (e) {
                    setAlert({
                        severity: 'error',
                        message: e.message
                    });
                    logger.error('End version failed', e);
                    clearModal();
                }
                clearModal();
            }
        } else {
            // student had no attempts remaining, so the backend already knows the version is closed
            setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
            setModalLoading(false);
        }
    };

    const generateScoreTable = (data: any) => {
        logger.info('SimpleProblemPage: generating a table of scores');
        const { problemScores, problemWeights, bestVersionScore, bestOverallVersion } = data;
        const totalActualWeight = _(problemWeights).values().sum();
        const totalWeight = totalActualWeight === 0 ? _(problemWeights).keys().value().length : totalActualWeight;

        return (
            <div className="d-flex flex-column">
                {
                    Object.keys(problemScores).map(key => {

                        let heading = '';
                        if (key === 'total') {
                            heading = 'Total points (this attempt)';
                        } else if (key === 'totalPossiblePoints') {
                            heading = 'Total possible points';
                        } else {
                            heading = `Problem #${key}`;
                        }

                        return (
                            <div className="d-flex flex-row" key={key}>
                                <div className="d-flex flex-column flex-grow-1">
                                    {heading}
                                </div>
                                <div className="d-flex flex-column justify-content-end">
                                    {problemScores[key]} {!_.isNil(problemWeights[key]) && `/ ${problemWeights[key]}`}
                                </div>
                            </div>
                        );
                    })
                }
                < div className="d-flex flex-row text-success">
                    <div className="d-flex flex-column flex-grow-1">Best Version Score</div>
                    <div className="d-flex flex-column justify-content-end">{bestVersionScore} ({(bestVersionScore / totalWeight).toPercentString()})</div>
                </div>
                < div className="d-flex flex-row text-success font-weight-bold">
                    <div className="d-flex flex-column flex-grow-1">Best Overall Score</div>
                    <div className="d-flex flex-column justify-content-end">{bestOverallVersion} ({(bestOverallVersion / totalWeight).toPercentString()})</div>
                </div>
            </div>
        );
    };

    const renderSavedStateIcon = (problem: ProblemObject) => ((problem.grades?.first?.hasBeenSaved === true) && <FaRegSave title='Recently saved' className='text-success' role='status' />);

    const renderDoneStateIcon = (problem: ProblemObject) => {
        let doneState: ProblemDoneState = ProblemDoneState.UNTOUCHED;
        const grade = problem.grades?.first;
        const instance = grade?.gradeInstances?.first; // this only exists on exams
        const overallBestScore = (!_.isNil(instance)) ? instance.overallBestScore : grade?.overallBestScore;
        const numAttempts = (!_.isNil(instance)) ?
            // one grade instance returned - which must carry the proper studentTopicAssessmentInfoId
            _.find(topic?.topicAssessmentInfo?.studentTopicAssessmentInfo, ['id', instance?.studentTopicAssessmentInfoId])?.numAttempts :
            grade?.numAttempts;

        if (_.isNil(numAttempts)) {
            // This is only an error if the user is enrolled in this course.
            if (!_.isNil(_.find(users, ['id', getUserId()]))) {
                logger.error(`No number of attempts found for User ${getUserId()} + Problem #${problem.id}`);
            }
        } else if (_.isNil(overallBestScore)) {
            // This is only an error if the user is enrolled in this course.
            if (!_.isNil(_.find(users, ['id', getUserId()]))) {
                logger.error(`No overall best score found for User ${getUserId()} + Problem #${problem.id}`);
            }
        } else if (numAttempts === 0 || topic?.topicAssessmentInfo?.showItemizedResults === false) {
            // do nothing - and prevent any done state icon
        } else if (overallBestScore === 1) {
            doneState = ProblemDoneState.COMPLETE;
        } else if (overallBestScore === 0) {
            doneState = ProblemDoneState.INCORRECT;
        } else if (overallBestScore < 1) {
            doneState = ProblemDoneState.PARTIAL;
        }

        switch (doneState) {
        case ProblemDoneState.COMPLETE:
            return (<> COMPLETE <BsCheckCircle className='text-success' role='status' /></>);
        case ProblemDoneState.INCORRECT:
            return (<> INCORRECT <BsXCircle className='text-danger' role='status' /></>);
        case ProblemDoneState.PARTIAL:
            return (<> PARTIAL <BsSlashCircle className='text-warning' role='status' /></>);
        case ProblemDoneState.UNTOUCHED:
        default:
            return;
        }
    };

    const clickedAskForHelp = async (questionId: number) => {
        logger.info('SimpleProblemPage: user clicked "Ask for Help"');
        try {
            const res = await askForHelp({questionId});
            const newTab = window.open(undefined, 'openlab');
            newTab?.document.write(res.data.data);
        } catch (e) {
            setAlert({
                severity: 'error',
                message: e.message ?? 'Failed to access OpenLabs.'
            });
        }
    };

    const requestShowMeAnother = async (questionId: number) => {
        try {
            logger.info('SimpleProblemPage: user requested "Show Me Another"');
            const res = await requestNewProblemVersion({ questionId });
            const grade = res.data.data;
            if (_.isNil(grade)) {
                logger.info('Failed to find another version of this problem.');
                setSmaHasNoVersions(true);
                setAlert({
                    severity: 'warning',
                    message: res.data.message ?? 'Failed to find another version of this problem.'
                });
            } else {
                setProblemStudentGrade(questionId, grade);
            }    
        } catch (e) {
            logger.error('requestShowMeAnother failed', e);
            setAlert({
                severity: 'error',
                message: 'An error occurred trying to fetch another version.'
            });
        }
    };

    if (loading) {
        return <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>;
    }

    // there's a serious problem if we get a topic, but no problems, and the topicType isn't an assessment
    if (!_.isNil(problems) &&
        _.isEmpty(problems) &&
        !_.isNil(topic) &&
        topic.topicTypeId !== 2) return <div>This topic does not have any questions.</div>;

    if (problems === null || selectedProblemId === null) return (
        <>
            {alert.message !== '' && <Alert severity={alert.severity}>{alert.message}</Alert>}
            { (topic?.topicTypeId === 2 && (versionsRemaining === 'unlimited' || versionsRemaining > 0) && topic.endDate.toMoment().isAfter(moment())) &&
                <Button variant='success'
                    tabIndex={0}
                    onClick={() => confirmStartNewVersion(topic, versionsRemaining)}
                >
                    Begin Exam
                </Button>
            }
            { (topic?.topicTypeId === 2 && (versionsRemaining === 0 || topic.endDate.toMoment().isBefore(moment()))) &&
                <div>There are no more versions of this assessment available.</div>
            }
            <ConfirmationModal
                {...confirmationParameters}
                onConfirm={() => {
                    confirmationParameters.onConfirm?.();
                    setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                }}
                onHide={() => {
                    setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                }}
            />
        </>
    );

    const selectedGradeId = problems[selectedProblemId].grades?.[0]?.id;
    const selectedGradeInstanceId = problems[selectedProblemId].grades?.[0]?.gradeInstances?.[0]?.id;

    return (
        <>
            <Container fluid className='fullheight-container'>
                <Row className='fullheight-row'>
                    <Col md={3} className='fullheight-col col-remove-scrollbar-padding'>
                        {
                            (topic?.topicTypeId === 2 && versionId) && (
                                <div className='flex-column text-center'>
                                    <div className='p-1 text-center flex-row'>
                                        {(attemptsRemaining > 0 || attemptsRemaining === 'unlimited') ?
                                            <Button variant='success'
                                                tabIndex={0}
                                                onClick={() => confirmSubmitVersion(topic.id, versionId)}
                                            >
                                                Submit Answers
                                            </Button> :
                                            <Button variant='success'
                                                tabIndex={0}
                                                onClick={() => confirmStartNewVersion(topic)}
                                                disabled={versionsRemaining <= 0}
                                            >
                                                {(versionsRemaining==='unlimited'||versionsRemaining>0) ? 'New Version' : 'Exam Completed'}
                                            </Button>
                                        }
                                        { !_.isNil(topic.topicAssessmentInfo) &&
                                        !_.isNil(topic.topicAssessmentInfo?.maxGradedAttemptsPerVersion) &&
                                        attemptsRemaining !== 0 &&
                                        (attemptsRemaining === 'unlimited' || 
                                        attemptsRemaining < topic.topicAssessmentInfo.maxGradedAttemptsPerVersion) &&
                                            <Button variant='danger'
                                                tabIndex={0}
                                                onClick={() => confirmEndVersion()}
                                            >
                                                End Exam
                                            </Button>
                                        }
                                    </div>
                                    <div className='flex-row'>
                                        Submissions remaining: {attemptsRemaining}
                                    </div>
                                </div>
                            )
                        }
                        <Nav variant='pills' className='flex-column' defaultActiveKey={selectedProblemId} activeKey={selectedProblemId}>
                            {_.chain(problems)
                                .values()
                                .sortBy(['problemNumber'])
                                .map(prob => {
                                    return (
                                        <NavLink
                                            eventKey={prob.id}
                                            key={`problemNavLink${prob.id}`}
                                            onSelect={() => { setSelectedProblemId(prob.id); }}
                                            role='link'
                                            style={{
                                                fontStyle: prob.optional ? 'italic' : undefined
                                            }}
                                        >
                                            {`Problem ${prob.problemNumber} (${prob.weight} Point${prob.weight === 1 ? '' : 's'})`}
                                            <span className='float-right'>{renderDoneStateIcon(prob)} {renderSavedStateIcon(prob)}</span>
                                        </NavLink>
                                    );
                                })
                                .value()
                            }
                        </Nav>
                    </Col>
                    <Col md={9} className='fullheight-col contains-lr-btn'>
                        <LeftRightArrowWrapper list={problems} setSelected={setSelectedProblemId} selected={selectedProblemId}>
                            <ProblemStateProvider>
                                {alert.message !== '' && <Alert severity={alert.severity}>{alert.message}</Alert>}
                                <ProblemDetails
                                    problem={problems[selectedProblemId]}
                                    topic={topic}
                                    attemptsRemaining={attemptsRemaining}
                                    setAttemptsRemaining={setAttemptsRemaining}
                                    setOpenDrawer={_.isNil(selectedGradeId) ? undefined : setOpenDrawer}
                                />
                                {topic && <SimpleProblemButtonRow
                                    problem={problems[selectedProblemId]}
                                    topic={topic}
                                    course={course}
                                    setOpenDrawer={setOpenDrawer}
                                    smaHasNoVersions={smaHasNoVersions}
                                    clickedAskForHelp={clickedAskForHelp}
                                    requestShowMeAnother={requestShowMeAnother}
                                />}
                                <AnimatePresence>
                                    <motion.div
                                        key={selectedProblemId}
                                        initial={{ x: 300, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: -300, opacity: 0 }}
                                    >
                                        <ProblemIframe
                                            problem={problems[selectedProblemId]}
                                            setProblemStudentGrade={setProblemStudentGrade}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </ProblemStateProvider>
                        </LeftRightArrowWrapper>
                    </Col>
                </Row>
                {selectedGradeId &&
                    <AttachmentsSidebar topic={topic || new TopicObject()} openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} gradeId={selectedGradeId} gradeInstanceId={selectedGradeInstanceId} />
                }
                <ConfirmationModal
                    {...confirmationParameters}
                    bodyContent={(modalLoading) ? 'Processing...' : confirmationParameters.bodyContent}
                    onHide={(modalLoading) ? () => { } : confirmationParameters.onHide}
                    confirmDisabled={modalLoading || confirmationParameters.confirmDisabled}
                    secondaryDisabled={modalLoading || confirmationParameters.secondaryDisabled}
                />
            </Container>
        </>
    );
};

export default SimpleProblemPage;
