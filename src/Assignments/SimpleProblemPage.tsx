import React, { useState, useEffect } from 'react';
import { ProblemObject, TopicObject } from '../Courses/CourseInterfaces';
import { Row, Col, Container, Nav, NavLink, Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ProblemIframe from './ProblemIframe';
import { BsCheckCircle, BsXCircle, BsSlashCircle } from 'react-icons/bs';
import { ProblemDoneState } from '../Enums/AssignmentEnums';
import _ from 'lodash';
import { endVersion, generateNewVersion, getQuestions, submitVersion } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { ProblemDetails } from './ProblemDetails';
import { ProblemStateProvider } from '../Contexts/CurrentProblemState';
import { ConfirmationModalProps, ConfirmationModal } from '../Components/ConfirmationModal';
import moment from 'moment';
import logger from '../Utilities/Logger';
import AttachmentsSidebar from './AttachmentsSidebar';

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
    const [problems, setProblems] = useState<Record<number, ProblemObject> | null>(null);
    const [topic, setTopic] = useState<TopicObject | null>(null);
    const [versionId, setVersionId] = useState<number | null>(null);
    const [attemptsRemaining, setAttemptsRemaining] = useState<number>(1); // the only time these two are not set
    const [versionsRemaining, setVersionsRemaining] = useState<number>(1); // is when an exam hasn't been attempted at all
    const [modalLoading, setModalLoading] = useState<boolean>(false);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmationParameters, setConfirmationParameters] = useState<ConfirmationModalProps>(DEFAULT_CONFIRMATION_PARAMETERS);
    const [openDrawer, setOpenDrawer] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
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
                setError(e.message);
                setLoading(false);
            }
        })();
    }, [params.topicId, versionId, attemptsRemaining]);

    const fetchProblems = async (topicId: number) => {
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
            setSelectedProblemId(_.sortBy(problems, ['problemNumber'])[0].id);
            if (!_.isNil(currentTopic.topicAssessmentInfo) &&
                !_.isNil(currentTopic.topicAssessmentInfo.studentTopicAssessmentInfo) &&
                currentTopic.topicAssessmentInfo.studentTopicAssessmentInfo.length > 0 // student has generated at least one version already
            ) {
                const currentVersion = _.maxBy(currentTopic.topicAssessmentInfo.studentTopicAssessmentInfo, 'startTime');
                if (!_.isNil(currentVersion) && !_.isNil(currentVersion?.numAttempts) && !_.isNil(currentVersion.maxAttempts)) {
                    // determine status from current version, don't rely on useState variables to be immediately accurate
                    const currentAttemptsRemaining = currentVersion.maxAttempts - currentVersion.numAttempts;
                    let currentVersionsRemaining = versionsRemaining;
                    if (!_.isNil(currentTopic.topicAssessmentInfo.maxVersions)) {
                        currentVersionsRemaining = currentTopic.topicAssessmentInfo.maxVersions - currentTopic.topicAssessmentInfo.studentTopicAssessmentInfo.length;
                        setVersionsRemaining(currentVersionsRemaining);
                    }

                    // if the assessment has been "closed" OR time has expired - do NOT allow submissions...
                    if (currentVersion.isClosed ||
                        currentVersion.endTime?.toMoment().isBefore(moment())
                    ) {
                        if (attemptsRemaining !== 0) setAttemptsRemaining(0); // avoid render loop when exam ends without having used all available attempts
                        if (currentTopic.topicAssessmentInfo.hideProblemsAfterFinish) {
                            if (currentVersionsRemaining > 0) {
                                setConfirmationParameters({
                                    show: true,
                                    onHide: () => setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS),
                                    onConfirm: () => confirmStartNewVersion(currentTopic, currentVersionsRemaining),
                                    headerContent: 'This version has expired',
                                    bodyContent: 'Would you like to start a new version of this assessment?'
                                });
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
                actualVersionsRemaining = currentTopic.topicAssessmentInfo.maxVersions - usedVersions;
                setVersionsRemaining(actualVersionsRemaining);
            }
            
            if (actualVersionsRemaining > 0 && 
                moment().isBetween(currentTopic.startDate.toMoment(), currentTopic.endDate.toMoment())
            ) {
                confirmStartNewVersion(currentTopic, actualVersionsRemaining, res.data.message);
            } else {
                // no problems were sent back, and user has used the maximum versions allowed
                setError(`${res.data.message} You have used all available versions for this assessment.`);
            }
        } else {
            const message = res.data.message || 'This topic does not contain any problems. Please contact your professor.';
            setError(message);
        }
    };

    // This should always be used on the selectedProblem.
    const setProblemStudentGrade = (val: any) => {
        if (_.isEmpty(problems) || problems === null || _.isNaN(selectedProblemId) || selectedProblemId === null) return;
        problems[selectedProblemId].grades = [val];
        setProblems({ ...problems });
    };

    const clearModal = () => {
        setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
        setModalLoading(false);
    };

    const confirmSubmitVersion = (topicId: number, versionId: number) => {
        setConfirmationParameters({
            show: true,
            headerContent: <h5>Submit my exam</h5>,
            bodyContent: 'You are about to use one of your exam attempts. This will score all problems for this assessment. Would you like to proceed?',
            onConfirm: async () => await getResultsOfSubmission(topicId, versionId),
            onHide: clearModal,
        });
    };

    const confirmStartNewVersion = (topic: TopicObject, actualVersionsRemaining?: number, message?: string) => {
        actualVersionsRemaining = actualVersionsRemaining ?? versionsRemaining; // retrieve from state if not supplied
        setConfirmationParameters({
            show: true,
            headerContent: <h5>Begin a new version</h5>,
            bodyContent: <div>
                {message} <br />
                You have {actualVersionsRemaining} {(actualVersionsRemaining === 1) ? ' version ' : ' versions '} remaining.<br />
                Are you ready to begin a new version of this assessment?
            </div>,
            onHide: clearModal,
            onConfirm: async () => await loadNewVersion(topic)
        });
    };

    const confirmEndVersion = (actualAttemptsRemaining?: number) => {
        actualAttemptsRemaining = actualAttemptsRemaining ?? attemptsRemaining;
        let message = 'You have successfully completed this exam.';
        if (actualAttemptsRemaining > 0) {
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
        setModalLoading(true);
        try {
            const result = await submitVersion({ topicId, versionId });
            const bodyContent = (_.isEmpty(result.data.data)) ? 'Your professor has blocked you from seeing your exam results at this time.' : generateScoreTable(result.data.data);
            const actualAttemptsRemaining = attemptsRemaining - 1;

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
                        clearModal
                });
            }
            setModalLoading(false);
        } catch (e) {
            setError(e.message);
            clearModal();
        }
    };

    const loadNewVersion = async (topic: TopicObject) => {
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
                        setError(e.message);
                    } else {
                        setError(`Another version of this assessment will be available after ${new Date(nextAvailableStartTime).toLocaleString()}.`);
                    }
                } else {
                    setError(e.message);
                }
                clearModal();
            }
        }
    };

    const endCurrentVersion = async (versionId: number) => {
        // const result = await endVersion({topicId, versionId});
        // if zero attemptsRemaining, we don't need to tell the backend to close
        if (!_.isNil(attemptsRemaining) && attemptsRemaining > 0) {
            if (_.isNil(topic)) {
                logger.error('This should not happen - no topic loaded');
            } else {
                setModalLoading(true);
                try {
                    await endVersion({ versionId });
                    setAttemptsRemaining(0);
                    fetchProblems(topic.id); // reload the problems in case they are supposed to be hidden after close
                } catch (e) {
                    setError(e.message);
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
        const { problemScores, bestVersionScore, bestOverallVersion } = data;
        return (
            <div className="d-flex flex-column">
                {
                    Object.keys(problemScores).map(key => {
                        return (
                            <div className="d-flex flex-row" key={key}>
                                <div className="d-flex flex-column flex-grow-1">{(key === 'total') ? 'Total for this attempt' : `Problem #${key}`}</div>
                                <div className="d-flex flex-column justify-content-end">{problemScores[key]}</div>
                            </div>
                        );
                    })
                }
                < div className="d-flex flex-row text-success">
                    <div className="d-flex flex-column flex-grow-1">Best Version Score</div>
                    <div className="d-flex flex-column justify-content-end">{bestVersionScore}</div>
                </div>
                < div className="d-flex flex-row text-success font-weight-bold">
                    <div className="d-flex flex-column flex-grow-1">Best Overall Score</div>
                    <div className="d-flex flex-column justify-content-end">{bestOverallVersion}</div>
                </div>
            </div>
        );
    };

    const renderDoneStateIcon = (problem: ProblemObject) => {
        let doneState: ProblemDoneState = ProblemDoneState.UNTOUCHED;
        const grade = problem.grades?.[0];
        const instance = grade?.gradeInstances?.[0];
        const overallBestScore = (topic?.topicTypeId === 2) ? instance?.overallBestScore : grade?.overallBestScore;
        const numAttempts = (topic?.topicTypeId === 2) ? 
            _.maxBy(topic.topicAssessmentInfo?.studentTopicAssessmentInfo, 'startTime')?.numAttempts : 
            grade?.numAttempts;

        if (_.isNil(numAttempts)) {
            logger.error(`no number of attempts found for problem #${problem.id}`);
        } else if (_.isNil(overallBestScore)) {
            logger.error(`no overall best score found for problem #${problem.id}`);
        } else if (numAttempts === 0 || topic?.topicAssessmentInfo?.showItemizedResults === false) {
            // Do nothing but skip everything else
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

    if (loading) {
        return <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // there's a serious problem if we get a topic, but no problems, and the topicType isn't an assessment
    if (_.isEmpty(problems) && 
        !_.isNil(topic) && 
        topic.topicTypeId !== 2) return <div>There was an error loading this assignment.</div>;

    if (problems === null || selectedProblemId === null) return (
        <>
            { (topic?.topicTypeId === 2 && versionsRemaining > 0 && topic.endDate.toMoment().isAfter(moment())) &&
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
            <Container fluid>
                <Row>
                    <Col md={3}>
                        {
                            (topic?.topicTypeId === 2 && versionId) && (
                                <div className='flex-column text-center'>
                                    <div className='p-1 text-center flex-row'>
                                        {(attemptsRemaining > 0) ?
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
                                                {(versionsRemaining>0) ? 'New Version' : 'Exam Completed'}
                                            </Button>
                                        }
                                        { topic.topicAssessmentInfo?.maxGradedAttemptsPerVersion && 
                                        attemptsRemaining !== 0 && 
                                        attemptsRemaining < topic.topicAssessmentInfo?.maxGradedAttemptsPerVersion &&
                                            <Button variant='danger'
                                                tabIndex={0}
                                                onClick={() => confirmEndVersion()}
                                            >
                                                End Exam
                                            </Button>
                                        }
                                    </div>
                                    <div className='flex-row'>
                                        Attempts remaining: {attemptsRemaining}
                                    </div>
                                </div>
                            )
                        }
                        <ConfirmationModal
                            {...confirmationParameters}
                            bodyContent={(modalLoading) ? 'Processing...' : confirmationParameters.bodyContent}
                            onHide={(modalLoading) ? () => { } : confirmationParameters.onHide}
                            confirmDisabled={modalLoading || confirmationParameters.confirmDisabled}
                            secondaryDisabled={modalLoading || confirmationParameters.secondaryDisabled}
                        />
                        <Nav variant='pills' className='flex-column' defaultActiveKey={selectedProblemId}>
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
                                            <span className='float-right'>{renderDoneStateIcon(prob)}</span>
                                        </NavLink>
                                    );
                                })
                                .value()
                            }
                        </Nav>
                    </Col>
                    <Col md={9}>
                        <ProblemStateProvider>
                            <ProblemDetails
                                problem={problems[selectedProblemId]}
                                topic={topic}
                                attemptsRemaining={attemptsRemaining}
                                setAttemptsRemaining={setAttemptsRemaining}
                                setOpenDrawer={setOpenDrawer}
                            />
                            {/* Temporarily disabled for release.  */}
                            {false && (<a href="https://openlab.citytech.cuny.edu/ol-webwork/" rel="noopener noreferrer" target="_blank" >
                                <Button className='float-right'>Ask for help</Button>
                            </a>)}
                            {<ProblemIframe
                                problem={problems[selectedProblemId]}
                                setProblemStudentGrade={setProblemStudentGrade}
                            />}
                        </ProblemStateProvider>
                    </Col>
                </Row>
                <AttachmentsSidebar topic={topic || new TopicObject()} openDrawer={openDrawer} setOpenDrawer={setOpenDrawer} gradeId={selectedGradeId} gradeInstanceId={selectedGradeInstanceId} />
            </Container>
        </>
    );
};

export default SimpleProblemPage;
