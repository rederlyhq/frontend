import React, { useState, useEffect, useRef } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import { Accordion, Card, Row, Col, Button, useAccordionToggle } from 'react-bootstrap';
import { useParams, useLocation } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';
import ProblemIframe from './ProblemIframe';

interface SimpleProblemPageProps {
}

// This simple page renders one problem at a time. Demo usage.
export const SimpleProblemPage: React.FC<SimpleProblemPageProps> = () => {
    let location = useLocation();
    // TODO: We should keep problems in state so we can modify them after completion.
    // const [problems, setProblems] = useState<Array<ProblemObject>>([location.state?.problems]);
    const topicId = useParams();
    const problems: Array<ProblemObject> = (location.state as any)?.problems;

    return (
        <>
            <h3>Homework</h3>
            {problems.map(problem => (
                <Accordion key={problem.id} defaultActiveKey="1">
                    <Card>
                        <Accordion.Toggle as={Card.Header} eventKey="0">
                            <Row>
                                <Col>
                                    <h4>{problem.webworkQuestionPath}</h4>
                                </Col>
                                <Col>
                                    {/* TODO: Status? */}
                                </Col>
                            </Row>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                <ProblemIframe problem={problem} />
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            ))
            }
        </>
    );
};

export default SimpleProblemPage;