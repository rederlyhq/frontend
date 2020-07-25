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
    const problems: Array<ProblemObject> = problemsFromState ? _.sortBy(problemsFromState, ['problemNumber']) : [];
    const [problemsDoneState, setProblemsDoneState] = useState<Array<ProblemDoneState>>(new Array(problems.length).fill(ProblemDoneState.UNTOUCHED));
    // TODO: Handle empty array case.
    const [selectedProblem, setSelectedProblem] = useState<ProblemObject>(problems[0]);

    // This should always be used on the selectedProblem.
    const setProblemDoneStateIcon = (val: ProblemDoneState) => {
        problemsDoneState[selectedProblem.problemNumber] = val;
        setProblemsDoneState([...problemsDoneState]);
    };

    const renderDoneStateIcon = (problemNumber: number) => {
        switch (problemsDoneState[problemNumber]) {
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
                            {problems.map((prob, id) => {
                                if (prob.problemNumber !== id+1) {
                                    console.error(`Problem number ${prob.problemNumber} and position in array ${id} do not match!`);
                                    // TODO: Should we throw an error and prevent these problems from being rendered?
                                    return (<div>There is an error with this problem set. Please contact your professor.</div>);
                                }
                                return (
                                    <NavLink 
                                        eventKey={prob.id} 
                                        key={`problemNavLink${prob.id}`} 
                                        onSelect={() => {setSelectedProblem(prob); console.log(`selecting ${prob.id}`);}}
                                        role={`Link to Problem ${prob.problemNumber}`}
                                    >
                                        {`Problem ${prob.problemNumber}`}
                                        <span className='float-right'>{renderDoneStateIcon(prob.problemNumber)}</span>
                                    </NavLink>
                                );
                            })}
                        </Nav>
                    </Col>
                    <Col md={9}>
                        <a href="https://openlab.citytech.cuny.edu/ol-webwork/" rel="noopener noreferrer" target="_blank" >
                            <Button className='float-right'>Ask for help</Button>
                        </a>
                        <ProblemIframe problem={selectedProblem} setProblemDoneStateIcon={setProblemDoneStateIcon}/>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default SimpleProblemPage;