import React, { useState, useEffect, useRef } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import { Accordion, Card, Row, Col, Button } from 'react-bootstrap';
import { useParams, useLocation } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';

interface SimpleProblemPageProps {
}

// This simple page renders one problem at a time. Demo usage.
export const SimpleProblemPage: React.FC<SimpleProblemPageProps> = () => {
    let location = useLocation();
    // TODO: We should keep problems in state so we can modify them after completion.
    // const [problems, setProblems] = useState<Array<ProblemObject>>([location.state?.problems]);
    const topicId = useParams();
    const problems: Array<ProblemObject> = (location.state as any)?.problems;
    const [iframeContent, setIframeContent] = useState<string>('');
    let iframeRef = useRef(null);

    useEffect(() => {
        (async () => {
            // const res = await AxiosRequest.get(`/courses/question/${problems[0].problemNumber}`);
            const res = await AxiosRequest.get(`/courses/question/13`);
            console.log(res.data);
            // console.log(res.data.data);
            // console.log(res.data.data.rendererData);
            // console.log(res.data.data.rendererData.renderedHTML);
            setIframeContent(res.data.data.rendererData.renderedHTML);


            if (!iframeRef) return;
            const current: any = iframeRef.current;
            console.log(current);
            if (!current) return;
            const iframeDoc: any = current.contentDocument;
            console.log(iframeDoc);
            if (!iframeDoc) return;
            iframeDoc.open();
            iframeDoc.write(res.data.data.rendererData.renderedHTML);
            iframeDoc.close();
        })();
    }, [iframeRef]);

    return (
        <>
            <h3>Homework</h3>
            {problems.map(problem => (
                <Accordion key={problem.problemNumber} defaultActiveKey="1">
                    <Card>
                        <Accordion.Toggle as={Card.Header} eventKey="0">
                            <Row>
                                <Col>
                                    <h4>{problem.problemNumber}</h4>
                                </Col>
                                <Col>
                                    TODO: Status?
                                </Col>
                            </Row>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey="0">
                            <Card.Body>
                                {/* {iframe} */}
                                {/* <div dangerouslySetInnerHTML={{__html: iframe}} /> */}
                                <iframe ref={iframeRef} style={{width: '100%', height: '100vh', border: 'none'}} />
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