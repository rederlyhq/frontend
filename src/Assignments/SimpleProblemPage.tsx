import React, { useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import { Row, Col, Container, Nav, NavLink, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import ProblemIframe from './ProblemIframe';
import { BsCheckCircle, BsXCircle, BsSlashCircle } from 'react-icons/bs';
import { ProblemDoneState } from '../Enums/AssignmentEnums';
import _ from 'lodash';

interface SimpleProblemPageProps {
}


// This page has two panes. The left pane renders a list of questions, and the right pane renders the currently selected question.
export const SimpleProblemPage: React.FC<SimpleProblemPageProps> = () => {
    let location = useLocation();
    // TODO: We should keep problems in state so we can modify them after completion.
    let problemsFromState: Array<ProblemObject> = (location.state as any)?.problems || [];
    const initialProblems: Array<ProblemObject> = problemsFromState ? _.sortBy(problemsFromState, ['problemNumber']) : [];
    // TODO: Handle empty array case.
    const [problems, setProblems] = useState<Array<ProblemObject>>(initialProblems);
    const [selectedProblem, setSelectedProblem] = useState<number>(0);

    // This should always be used on the selectedProblem.
    const setProblemDoneStateIcon = (val: ProblemDoneState) => {
        problems[selectedProblem].doneState = val;
        setProblems([...problems]);
    };

    const renderDoneStateIcon = (problem: ProblemObject) => {
        switch (problem.doneState) {
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
                                        role={`Link to Problem ${prob.problemNumber}`}
                                    >
                                        {`Problem ${prob.problemNumber}`}
                                        <span className='float-right'>{renderDoneStateIcon(prob)}</span>
                                    </NavLink>
                                );
                            })}
                        </Nav>
                    </Col>
                    <Col md={9}>
                        <a href="https://openlab.citytech.cuny.edu/ol-webwork/" rel="noopener noreferrer" target="_blank" >
                            <Button className='float-right'>Ask for help</Button>
                        </a>
                        <ProblemIframe problem={problems[selectedProblem]} setProblemDoneStateIcon={setProblemDoneStateIcon}/>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default SimpleProblemPage;