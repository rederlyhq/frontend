import React, { useState, useEffect } from 'react';
import { ProblemObject, TopicObject } from '../Courses/CourseInterfaces';
import { Row, Col, Container, Nav, NavLink, Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ProblemIframe from './ProblemIframe';
import { BsCheckCircle, BsXCircle, BsSlashCircle } from 'react-icons/bs';
import { ProblemDoneState } from '../Enums/AssignmentEnums';
import _ from 'lodash';
import { getQuestions } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { ProblemDetails } from './ProblemDetails';
import { ProblemStateProvider } from '../Contexts/CurrentProblemState';

interface SimpleProblemPageProps {
}

interface SimpleProblemPageLocationParams {
    topicId?: string;
    courseId?: string;
}

// This page has two panes. The left pane renders a list of questions, and the right pane renders the currently selected question.
export const SimpleProblemPage: React.FC<SimpleProblemPageProps> = () => {
    const params = useParams<SimpleProblemPageLocationParams>();
    const [problems, setProblems] = useState<Record<number, ProblemObject> | null>(null);
    const [topic, setTopic] = useState<TopicObject | null>(null);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(()=>{
        setLoading(true);
        (async () => {
            try {
                if(_.isNil(params.topicId)) {
                    console.error('topicId is null');
                    setError('An unexpected error has occurred');
                    return;
                }
                const res = await getQuestions({
                    userId: 'me',
                    courseTopicContentId: parseInt(params.topicId, 10)
                });
                const problems: Array<ProblemObject> = res.data.data.questions;
                
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
                    setSelectedProblemId(problems[0].id);
                }

                setLoading(false);
            } catch (e) {
                setError(e.message);
                console.error(e);
                setLoading(false);
            }
        })();
    }, [params.topicId]);

    // This should always be used on the selectedProblem.
    const setProblemStudentGrade = (val: any) => {
        if (_.isEmpty(problems) || problems === null || _.isNaN(selectedProblemId) || selectedProblemId === null) return;
        problems[selectedProblemId].grades = [val];
        setProblems({...problems});
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

    if (_.isEmpty(problems)) return <div>There was an error loading this assignment.</div>;

    if (problems === null || selectedProblemId === null) return <div>Loading...</div>;

    return (
        <>
            <Container fluid>
                <Row>
                    <Col md={3}>
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
