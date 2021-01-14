import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Nav, NavLink } from 'react-bootstrap';
import _ from 'lodash';
import { ProblemStateProvider } from '../Contexts/CurrentProblemState';
import ProblemIframe from '../Assignments/ProblemIframe';
import { ProblemObject } from '../Courses/CourseInterfaces';
import { useQuery } from '../Hooks/UseQuery';
import { getSearch } from '../APIInterfaces/LibraryBrowser/LibraryBrowserRequests';
import nodePath from 'path';
import { catalog, getProblemSearchResults } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../Utilities/Logger';
import { useQuerystringHelper, QueryStringMode } from '../Hooks/useQuerystringHelper';
const urlJoin: (...args: string[]) => string = require('url-join');

interface ProblemBrowserResultsProps {

}

enum SearchType {
    LIBRARY='library',
    PRIVATE='private',
    COURSE='course',
}

interface ProblemNavItemOptions {
    problemPath: string;
    onSelect: (path: string) => unknown;
}

export const ProblemNavItem: React.FC<ProblemNavItemOptions> = ({
    problemPath,
    onSelect,
}) => {
    return (
        <NavLink
            eventKey={problemPath}
            key={problemPath}
            onSelect={() => onSelect(problemPath)}
            role='link'
        >
            <h5>{nodePath.basename(problemPath)}</h5>
            <h6>{problemPath}</h6>
        </NavLink>
    );
};


interface SearchProblemResult<T = unknown> {
    path: string;
    meta?: T;
}

interface SearchResults<T = unknown> {
    type: SearchType;
    problems: {[key: string]: SearchProblemResult<T>}
}

export const ProblemBrowserResults: React.FC<ProblemBrowserResultsProps> = () => {
    const queryParams = useQuery();
    const { updateRoute, getCurrentQueryStrings } = useQuerystringHelper();
    const searchType = queryParams.get('type') as SearchType | null;
    const [problemDictionary, setProblemDictionary] = useState<SearchResults | null>(null);
    const problems = useMemo<Array<SearchProblemResult> | null>(() => _.isNil(problemDictionary) ? null : Object.values(problemDictionary.problems), [problemDictionary]);
    const [selectedProblem, setSelectedProblem] = useState<string | null>(queryParams.get('path'));

    useEffect(() => {
        queryParams.get('path');
        const firstProblem = problems?.first;
        if (_.isNil(selectedProblem) && !_.isNil(firstProblem)) {
            setSelectedProblem(firstProblem.path);
        }
    }, [selectedProblem, problems]);

    useEffect(() => {
        updateRoute({
            path: {
                val: selectedProblem,
                mode: QueryStringMode.OVERWRITE
            },
        }, true);
    }, [selectedProblem]);

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
                setProblemDictionary({
                    type: SearchType.LIBRARY,
                    problems: _.keyBy(result.data.data.result.map(pgPath => ({ path: urlJoin('Library', pgPath.opl_path.path, pgPath.filename)})), 'path')
                });
                break;
            }
            case SearchType.PRIVATE: {
                const result = await catalog();
                const problemObjects = result.data.data.problems.map((problem: string) => ({ path: problem }));

                setProblemDictionary({
                    type: SearchType.PRIVATE,
                    problems: _.keyBy(problemObjects, 'path'),
                });
                break;
            }
            case SearchType.COURSE: {
                const courseId = parseInt(queryParams.get('courseId') ?? '', 10);
                const unitId = parseInt(queryParams.get('unitId') ?? '', 10);
                const topicId = parseInt(queryParams.get('topicId') ?? '', 10);
                const result = await getProblemSearchResults({
                    params: _.omitBy({
                        instructorId: 'me',
                        courseId: courseId,
                        unitId: unitId,
                        topicId: topicId,
                    }, _.isNaN)
                });
                const problemObjects = result.data.data.problems.map((problem) => ({ path: problem.webworkQuestionPath}));
                setProblemDictionary({
                    type: SearchType.COURSE,
                    problems: _.keyBy(problemObjects, 'path'),
                });
                break;
            }
            default:
                logger.warn('ProblemBrowserResults: Invalid type, either a bug or someone is manipulating the url');
                setProblemDictionary({
                    type: SearchType.COURSE,
                    problems: {}
                });
                break;
            }
        })();
    }, [searchType]);

    if (_.isNil(problems)) {
        return <div>Loading...</div>;
    }

    if (_.isEmpty(problems)) {
        return <div>There are no problems to display</div>;
    }

    if (_.isNil(selectedProblem)) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {/* {alert.message !== '' && <Alert severity={alert.severity}>{alert.message}</Alert>} */}
            <Container fluid>
                <Row>
                    <Col md={3}>
                        <Nav variant='pills' className='flex-column' defaultActiveKey={selectedProblem} style={{wordBreak: 'break-word'}}>
                            {/* {problems.map(problem => ProblemNavItem({problemPath: problem.path, onSelect: (path: string) => setSelectedProblem(path)}))} */}
                            {problems.map(problem => <ProblemNavItem key={problem.path} problemPath={problem.path} onSelect={(path: string) => setSelectedProblem(path)} /> )}
                        </Nav>
                    </Col>
                    <Col md={9}>
                        <ProblemStateProvider>
                            {!_.isNil(selectedProblem) &&
                                <ProblemIframe 
                                    problem={new ProblemObject()} 
                                    previewPath={selectedProblem}
                                    previewSeed={1}
                                    setProblemStudentGrade={() => {}}
                                    readonly={false} /> 
                            }
                        </ProblemStateProvider>
                    </Col>
                </Row>
            </Container>
        </>
    );
};
