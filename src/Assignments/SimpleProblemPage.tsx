import React, { useState, useEffect } from 'react';
import { ProblemObject, StudentTopicAssessmentFields, TopicObject } from '../Courses/CourseInterfaces';
import { Row, Col, Container, Nav, NavLink, Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ProblemIframe from './ProblemIframe';
import { BsCheckCircle, BsXCircle, BsSlashCircle } from 'react-icons/bs';
import { ProblemDoneState } from '../Enums/AssignmentEnums';
import _ from 'lodash';
import { generateNewVersion, getQuestions, submitVersion } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { ProblemDetails } from './ProblemDetails';
import { ProblemStateProvider } from '../Contexts/CurrentProblemState';
import { ConfirmationModal } from '../Components/ConfirmationModal';
import ModalWithChildren from '../Components/ModalWithChildren';

interface SimpleProblemPageProps {
}

interface SimpleProblemPageLocationParams {
    versionId?: string;
    topicId?: string;
    courseId?: string;
}

// This page has two panes. The left pane renders a list of questions, and the right pane renders the currently selected question.
export const SimpleProblemPage: React.FC<SimpleProblemPageProps> = () => {
    const DEFAULT_CONFIRMATION_PARAMETERS = {
        show: false,
        onConfirm: null,
        headerText: '',
        bodyText: ''
    };
    const DEFAULT_GRADE_PARAMETERS = {
        show: false,
        headerText: '',
        children: null,
    };

    const params = useParams<SimpleProblemPageLocationParams>();
    const [problems, setProblems] = useState<Record<number, ProblemObject> | null>(null);
    const [topic, setTopic] = useState<TopicObject | null>(null);
    const [versionId, setVersionId] = useState<number | null>(null); 
    // const [versionId, setVersionId] = useState<number | null>(null);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmationParameters, setConfirmationParameters] = useState<{ show: boolean, headerText: string, bodyText: string, onConfirm?: (() => unknown) | null }>(DEFAULT_CONFIRMATION_PARAMETERS);
    const [gradeResultParameters, setGradeResultParameters] = useState<{ show: boolean, headerText: string, children: React.ReactNode  }>(DEFAULT_GRADE_PARAMETERS);

    useEffect(()=>{
        setLoading(true);
        (async () => {
            try {
                if(_.isNil(params.topicId)) {
                    console.error('topicId is null');
                    setError('An unexpected error has occurred');
                    return;
                }

                await fetchProblems(params.topicId);
                setLoading(false);
            } catch (e) {
                setError(e.message);
                console.error(e);
                setLoading(false);
            }
        })();
    }, [params.topicId]);

    const fetchProblems = async (topicId: string) => {
        const res = await getQuestions({
            userId: 'me',
            courseTopicContentId: parseInt(topicId, 10)
        });
        const problems: Array<ProblemObject> = res.data.data.questions;
        console.log('drew:',problems);

        const topic = res.data.data.topic;

        if (topic.studentTopicOverride?.length > 0) {
            _.assign(topic, topic.studentTopicOverride[0]);
        }
        setTopic(topic);

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
            if (!_.isNil(topic.topicAssessmentInfo) &&
                !_.isNil(topic.topicAssessmentInfo.studentTopicAssessmentInfo) &&
                topic.topicAssessmentInfo.studentTopicAssessmentInfo.length > 0
            ) {
                topic.topicAssessmentInfo.studentTopicAssessmentInfo = _.sortBy(topic.topicAssessmentInfo.studentTopicAssessmentInfo, ['startTime']).reverse();
                console.log('drew:', topic);
                setVersionId(topic.topicAssessmentInfo.studentTopicAssessmentInfo[0].id!);
            }
        } else if (topic.topicTypeId === 2 && !_.isNil(topic.topicAssessmentInfo)) { // how the HELL are enums supposed to work?!
            const usedAttempts = topic.studentTopicAssessmentInfo?.length ?? 0;
            if (usedAttempts < topic.topicAssessmentInfo.maxVersions) {
                setConfirmationParameters({
                    show: true,
                    headerText: 'Begin a new version',
                    bodyText: `${res.data.message} Would you like to begin a new version of this assessment?`,
                    onConfirm: async () => {
                        const version = await generateNewVersion({ topicId: topic.id }) as StudentTopicAssessmentFields;
                        if (_.isNil(topic.studentTopicAssessmentInfo) === false && topic.studentTopicAssessmentInfo.length > 0) {
                            topic.studentTopicAssessmentInfo.push(version);
                        } else {
                            topic.studentTopicAssessmentInfo = [version];
                        }
                        setTopic(topic);
                        setVersionId(version.id!);
                        await fetchProblems(topicId);
                    }
                });
            }
        }
    };

    // This should always be used on the selectedProblem.
    const setProblemStudentGrade = (val: any) => {
        if (_.isEmpty(problems) || problems === null || _.isNaN(selectedProblemId) || selectedProblemId === null) return;
        problems[selectedProblemId].grades = [val];
        setProblems({...problems});
    };

    const clickSubmitVersion = (topicId: number, versionId: number) => {
        setConfirmationParameters({
            show: true,
            headerText: 'Submit my exam',
            bodyText: 'You are about to use one of your graded submissions. Proceed?',
            onConfirm: async () => { 
                const result = await submitVersion({topicId, versionId});
                const children = await generateScoreTable(result.data.data);
                setGradeResultParameters({
                    show: true,
                    headerText: 'Submission Results',
                    children,
                });
            }
        });
    };

    const generateScoreTable = async (data: any) => {
        const {problemScores, bestVersionScore, bestOverallVersion} = data;
        Object.keys(problemScores).map(key => {
            console.log('drew: ', key, problemScores[key]);
        });
        return (
            <div className="d-flex flex-column">
                {
                    Object.keys(problemScores).map( key => { return (
                        <div className="d-flex flex-row" key={key}>
                            <div className="d-flex flex-column flex-grow-1">{(key === 'total')? 'Total for this attempt' : `Problem #${key}`}</div>
                            <div className="d-flex flex-column justify-content-end">{problemScores[key]}</div>
                        </div>
                    );})
                }
                < div className="d-flex flex-row">
                    <div className="d-flex flex-column flex-grow-1">Best Version Score</div>
                    <div className="d-flex flex-column justify-content-end">{bestVersionScore}</div>
                </div>
                < div className="d-flex flex-row">
                    <div className="d-flex flex-column flex-grow-1">Best Overall Score</div>
                    <div className="d-flex flex-column justify-content-end">{bestOverallVersion}</div>
                </div>
            </div>
        );
    };

    const renderDoneStateIcon = (problem: ProblemObject) => {
        let doneState: ProblemDoneState = ProblemDoneState.UNTOUCHED;
        if (_.isNil(problem.grades) || _.isNil(problem.grades[0]) || problem.grades[0].numAttempts === 0) {
            // Do nothing but skip everything else
        } else if(problem.grades[0].overallBestScore === 1) {
            doneState = ProblemDoneState.COMPLETE;
        } else if (problem.grades[0].overallBestScore === 0) {
            doneState = ProblemDoneState.INCORRECT;
        } else if (problem.grades[0].overallBestScore < 1) {
            doneState = ProblemDoneState.PARTIAL;
        }
    
        switch (doneState) {
        case ProblemDoneState.COMPLETE:
            return (<> COMPLETE <BsCheckCircle className='text-success' role='status'/></>);
        case ProblemDoneState.INCORRECT:
            return (<> INCORRECT <BsXCircle className='text-danger' role='status'/></>);
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

    // if (_.isEmpty(problems)) return <div>There was an error loading this assignment.</div>;

    if (problems === null || selectedProblemId === null) return (
        <>
            <ConfirmationModal
                onConfirm={() => {
                    confirmationParameters.onConfirm?.();
                    setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                }}
                onHide={() => {
                    setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                }}
                show={confirmationParameters.show}
                headerContent={<h5>{confirmationParameters.headerText}</h5>}
                bodyContent={confirmationParameters.bodyText}
            />
        </>
    );

    return (
        <>
            <Container fluid>
                <Row>
                    <Col md={3}>
                        {
                            (topic?.topicTypeId === 2 && versionId) && (
                                <div className='p-3 text-center'>
                                    <Button variant='success'
                                        tabIndex={0}
                                        onClick={() => { clickSubmitVersion(topic.id, versionId);}}
                                    >
                                        Submit Answers
                                    </Button>
                                    <Button variant='danger'
                                        tabIndex={0}
                                        onClick={() => {alert('ending exam early');}}
                                    >
                                        End Exam
                                    </Button>
                                </div>
                            )
                        }
                        <ConfirmationModal
                            onConfirm={() => {
                                confirmationParameters.onConfirm?.();
                                setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                            }}
                            onHide={() => {
                                setConfirmationParameters(DEFAULT_CONFIRMATION_PARAMETERS);
                            }}
                            show={confirmationParameters.show}
                            headerContent={<h5>{confirmationParameters.headerText}</h5>}
                            bodyContent={confirmationParameters.bodyText}
                        />
                        <ModalWithChildren
                            show={gradeResultParameters.show}
                            header={gradeResultParameters.headerText}
                            // eslint-disable-next-line react/no-children-prop
                            children={gradeResultParameters.children}
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
                                            onSelect={() => {setSelectedProblemId(prob.id);}}
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
            </Container>
        </>
    );
};

export default SimpleProblemPage;
