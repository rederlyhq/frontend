import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, NavLink } from 'react-bootstrap';
import _ from 'lodash';
import { ProblemStateProvider } from '../Contexts/CurrentProblemState';
import ProblemIframe from '../Assignments/ProblemIframe';
import { ProblemObject } from '../Courses/CourseInterfaces';
import { useQuery } from '../Hooks/UseQuery';
import { getSearch } from '../APIInterfaces/LibraryBrowser/LibraryBrowserRequests';
import nodePath from 'path';
import { catalog } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
const urlJoin: (...args: string[]) => string = require('url-join');

interface ProblemBrowserResultsProps {

}

enum SearchType {
    LIBRARY='library',
    PRIVATE='private',
}

interface ProblemNavItemOptions {
    problemPath: string;
    onSelect: (path: string) => unknown;
}

const ProblemNavItem = ({
    problemPath,
    onSelect
}: ProblemNavItemOptions) => {
    return (
        <NavLink
            eventKey={problemPath}
            key={`problemNavLink${problemPath}`}
            onSelect={() => onSelect(problemPath)}
            role='link'
        >
            <h5>{nodePath.basename(problemPath)}</h5>
            <h6>{problemPath}</h6>
        </NavLink>
    );
};

export const ProblemBrowserResults: React.FC<ProblemBrowserResultsProps> = () => {
    const queryParams = useQuery();
    const searchType = queryParams.get('type') as SearchType | null;
    const [problems, setProblems] = useState<Array<string> | null>(null);
    const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            switch (searchType) {
            case SearchType.LIBRARY: {
                const subjectId = parseInt(queryParams.get('subjectId') ?? '', 10);
                const chapterId = parseInt(queryParams.get('chapterId') ?? '', 10);
                const sectionId = parseInt(queryParams.get('sectionId') ?? '', 10);
                const result = await getSearch({
                    params: _.omitBy({
                        subjectId,
                        chapterId,
                        sectionId,
                    }, _.isNaN)
                });
                setProblems(result.data.data.result.map(pgPath => urlJoin('Library', pgPath.opl_path.path, pgPath.filename)));
                break;
            }
            case SearchType.PRIVATE: {
                const result = await catalog();
                setProblems(result.data.data.problems);
                break;
            }
            default:
                setProblems([]);
                break;
            }
        })();
    }, [searchType]);
    const selectedProblemId = 0;

    if (_.isNil(problems)) {
        return <div>Loading...</div>;
    }

    if (_.isEmpty(problems)) {
        return <div>There are no problems to display</div>;
    }

    return (
        <>
            {/* {alert.message !== '' && <Alert severity={alert.severity}>{alert.message}</Alert>} */}
            <Container fluid>
                <Row>
                    <Col md={3}>
                        <Nav variant='pills' className='flex-column' defaultActiveKey={selectedProblemId}>
                            {problems.map(problem => ProblemNavItem({problemPath: problem, onSelect: (path: string) => setSelectedProblem(path)}))}
                        </Nav>
                    </Col>
                    <Col md={9}>
                        <ProblemStateProvider>
                            <ProblemIframe 
                                problem={new ProblemObject()} 
                                previewPath={selectedProblem ?? ''}
                                previewSeed={1}
                                setProblemStudentGrade={() => {}}
                                readonly={false} /> 
                        </ProblemStateProvider>
                    </Col>
                </Row>
            </Container>
        </>
    );
};
