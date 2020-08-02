import React, { useState, useEffect } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import AxiosRequest from '../Hooks/AxiosRequest';
import { Row, Col, Container, Nav, NavLink, Button, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import ProblemIframe from './ProblemIframe';
import { BsCheckCircle, BsXCircle, BsSlashCircle } from 'react-icons/bs';
import { ProblemDoneState } from '../Enums/AssignmentEnums';
import _ from 'lodash';
import {Upload} from "./Upload";


interface SimpleProblemPageProps {
}

interface SimpleProblemPageLocationParams {
    topicId?: string;
    courseId?: string;
}

// This page has two panes. The left pane renders a list of questions, and the right pane renders the currently selected question.
export const SimpleProblemPage: React.FC<SimpleProblemPageProps> = () => {
    const params = useParams<SimpleProblemPageLocationParams>();
    // // TODO: We should keep problems in state so we can modify them after completion.
    // let problemsFromState: Array<ProblemObject> = (location.state as any)?.problems || [];
    // const initialProblems: Array<ProblemObject> = problemsFromState ? _.sortBy(problemsFromState, ['problemNumber']) : [];
    // TODO: Handle empty array case.
    const [problems, setProblems] = useState<Array<ProblemObject>>([]);
    const [selectedProblem, setSelectedProblem] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(()=>{
        setLoading(true);
        (async () => {
            try {
                const res = await AxiosRequest.get('/courses/questions/', {
                    params: {
                        userId: 'me',
                        courseTopicContentId: params.topicId
                    }
                });
                setProblems(res.data.data);
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
        problems[selectedProblem-1].grades = [val];
        setProblems([...problems]);
    };

    const renderDoneStateIcon = (problem: ProblemObject) => {
        let doneState: ProblemDoneState = ProblemDoneState.UNTOUCHED;
        if (_.isNil(problem.grades) || _.isNil(problem.grades[0]) || problem.grades[0].numAttempts === 0) {
            // Do nothing but skip everything else
        } else if(problem.grades[0].overallBestScore === 1) {
            doneState = ProblemDoneState.CORRECT;
        } else if (problem.grades[0].overallBestScore === 0) {
            doneState = ProblemDoneState.INCORRECT;
        } else if (problem.grades[0].overallBestScore < 1) {
            doneState = ProblemDoneState.PARTIAL;
        }
    
        switch (doneState) {
        case ProblemDoneState.CORRECT:
            return (<> CORRECT <BsCheckCircle className='text-success' role='status'/></>);
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

    if (problems.length <= 0) return <div>There was an error loading this assignment.</div>;

    return (
        <>
            <h3>Homework</h3>
            <Container fluid>
                <Row>
                    <Col md={3}>
                        <Nav variant='pills' className='flex-column' defaultActiveKey={problems[0].id}>
                            {problems.map(prob => {
                                return (
                                    <NavLink 
                                        eventKey={prob.id} 
                                        key={`problemNavLink${prob.id}`} 
                                        onSelect={() => {setSelectedProblem(prob.problemNumber); console.log(`selecting ${prob.id}`);}}
                                        role='link'
                                    >
                                        {`Problem ${prob.problemNumber}`}
                                        <span className='float-right'>{renderDoneStateIcon(prob)}</span>
                                    </NavLink>
                                );
                            })}
                        </Nav>
                    </Col>
                    <Col md={9}>
                    <div>
                            <p className="title">React Drag and Drop Image Upload</p>
                            <div className="content">
                                <Upload/>
                            </div>
                            </div>
                        {/* Temporarily disabled for release.  */}
                        {false && (<a href="https://openlab.citytech.cuny.edu/ol-webwork/" rel="noopener noreferrer" target="_blank" >
                            <Button className='float-right'>Ask for help</Button>
                        </a>)}
                        <ProblemIframe problem={problems[selectedProblem-1]} setProblemStudentGrade={setProblemStudentGrade}/>
                    </Col>
                </Row>
                
            </Container>
        </>
    );
};

export default SimpleProblemPage;
