import React, { useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import { Row, Col, Container, Nav, NavLink } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import ProblemIframe from './ProblemIframe';

interface SimpleProblemPageProps {
}

// This page has two panes. The left pane renders a list of questions, and the right pane renders the currently selected question.
export const SimpleProblemPage: React.FC<SimpleProblemPageProps> = () => {
    let location = useLocation();
    // TODO: We should keep problems in state so we can modify them after completion.
    // const [problems, setProblems] = useState<Array<ProblemObject>>([location.state?.problems]);
    const problems: Array<ProblemObject> = (location.state as any)?.problems;
    // TODO: Handle empty array case.
    const [selectedProblem, setSelectedProblem] = useState<ProblemObject>(problems[0]);

    return (
        <>
            <h3>Homework</h3>
            <Container fluid>
                <Row>
                    <Col md={3}>
                        <Nav variant='pills' className='flex-column' defaultActiveKey={problems[0].id}>
                            {problems.map(prob => (
                                <NavLink 
                                    eventKey={prob.id} 
                                    key={prob.id} 
                                    onSelect={() => {setSelectedProblem(prob); console.log(`selecting ${prob.id}`);}}
                                    role={`Link to Problem ${prob.problemNumber}`}
                                >
                                    {`Problem ${prob.problemNumber}`}
                                </NavLink>
                            ))}
                        </Nav>
                    </Col>
                    <Col md={9}>
                        <ProblemIframe problem={selectedProblem} />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default SimpleProblemPage;