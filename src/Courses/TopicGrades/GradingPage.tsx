import React, { useState, useEffect } from 'react';
import { ProblemObject, StudentGrade, TopicObject } from '../CourseInterfaces';
import { Row, Col, Container, Nav, NavLink, Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useCourseContext } from '../CourseProvider';
import ProblemIframe from '../../Assignments/ProblemIframe';
import _ from 'lodash';
import { getAssessmentProblemsWithWorkbooks, getQuestions } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { ProblemDetails } from '../../Assignments/ProblemDetails';
import { ProblemStateProvider } from '../../Contexts/CurrentProblemState';
import moment from 'moment';
import logger from '../../Utilities/Logger';

interface SimpleProblemPageProps {
}

interface SimpleProblemPageLocationParams {
    topicId?: string;
    courseId?: string;
}

// This page has two panes. The left pane renders a list of questions, and the right pane renders the currently selected question.
export const SimpleProblemPage: React.FC<SimpleProblemPageProps> = () => {
    const { users } = useCourseContext();
    const params = useParams<SimpleProblemPageLocationParams>();
    const [problems, setProblems] = useState<Record<number, ProblemObject> | null>(null);
    const [topic, setTopic] = useState<TopicObject | null>(null);
    const [selectedWorkbookId, setSelectedWorkbookId] = useState<number | null>(null);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const userMap = _(users).keyBy('id').value();

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
    }, [params.topicId]);

    useEffect(() => {
        setLoading(true);
        (async () => {
            try {
                if (_.isNil(selectedProblemId)) {
                    logger.error('selected problem is null');
                    throw new Error('An unexpected error has occurred');
                } else {
                    // organize grades/workbooks 
                    // await fetchProblems(parseInt(params.topicId, 10));
                }
                setLoading(false);
            } catch (e) {
                setError(e.message);
                setLoading(false);
            }
        })();
    }, [selectedProblemId]);

    // https://stackoverflow.com/questions/40937961/lodash-keyby-for-multiple-nested-level-arrays
    const deepKeyBy = (arr: Array<any>, key: string): Record<number, any> => {
        return _(arr)
            .map(function (o) {
                return _.mapValues(o, function (v) {
                    return _.isArray(v) ? deepKeyBy(v, key) : v;
                });
            })
            .keyBy(key)
            .value();
    };

    const fetchProblems = async (topicId: number) => {
        const res = await getAssessmentProblemsWithWorkbooks({topicId});
        const problems: Array<ProblemObject> = res.data.data.questions;

        const currentTopic = res.data.data.topic;

        if (currentTopic.studentTopicOverride?.length > 0) {
            _.assign(currentTopic, currentTopic.studentTopicOverride[0]);
        }
        setTopic(currentTopic);

        if (!_.isEmpty(problems)) {
            const problemDictionary = deepKeyBy(problems, 'id') as Record<number, ProblemObject>;
            setProblems(problemDictionary);
            setSelectedProblemId(_.minBy(problems, 'problemNumber').id);
        } else { // we are definitely an assessment - topicAssessmentInfo *should* never be missing
            setError('No problems in this topic.');
        }
    };

    // This should always be used on the selectedProblem.
    const setProblemStudentGrade = (val: any) => {
        if (_.isEmpty(problems) || problems === null || _.isNaN(selectedProblemId) || selectedProblemId === null) return;
        problems[selectedProblemId].grades = [val];
        setProblems({ ...problems });
    };

    if (loading) {
        return <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // there's a serious problem if we get a topic, but no problems, and the topicType isn't an assessment
    if (_.isEmpty(problems) && !_.isNil(topic) && topic.topicTypeId !== 2) return <div>There was an error loading this assignment.</div>;

    if (problems === null || selectedProblemId === null) return (
        <>
        </>
    );

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
                                            onSelect={() => { setSelectedProblemId(prob.id); }}
                                            role='link'
                                            style={{
                                                fontStyle: prob.optional ? 'italic' : undefined
                                            }}
                                        >
                                            {`Problem ${prob.problemNumber} (${prob.weight} Point${prob.weight === 1 ? '' : 's'})`}
                                            {/* <span className='float-right'>{renderDoneStateIcon(prob)}</span> */}
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
                                readonly={true}
                                workbookId={selectedWorkbookId}
                            />}
                        </ProblemStateProvider>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default SimpleProblemPage;
