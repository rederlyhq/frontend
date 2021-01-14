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
import { ProblemBrowserSearchType, ProblemBrowserDataMeta } from './ProblemBrowserTypes';
import { ProblemBrowserHeader } from './ProblemBrowserHeader';
const urlJoin: (...args: string[]) => string = require('url-join');

interface ProblemBrowserResultsProps {

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
            style={{
                display: 'block',
                width: '100%'
            }}
        >
            <h5>{nodePath.basename(problemPath)}</h5>
            <h6
                style={{
                    // wordBreak: 'break-all',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}
            >{problemPath}</h6>
        </NavLink>
    );
};


interface SearchProblemResult {
    path: string;
    meta: ProblemBrowserDataMeta;
}

interface SearchResults {
    problems: Dictionary<SearchProblemResult>
}

export const ProblemBrowserResults: React.FC<ProblemBrowserResultsProps> = () => {
    const queryParams = useQuery();
    const { updateRoute } = useQuerystringHelper();
    const searchType = queryParams.get('type') as ProblemBrowserSearchType | null;
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
            case ProblemBrowserSearchType.LIBRARY: {
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
                const problemArray: Array<SearchProblemResult> = result.data.data.result.map(pgPath => ({
                    path: urlJoin('Library', pgPath.path, pgPath.filename),
                    meta: {
                        type: ProblemBrowserSearchType.LIBRARY,
                        subjectName: pgPath.subjectName,
                        chapterName: pgPath.chapterName,
                        sectionName: pgPath.sectionName,
                    }
                }));
                const problemDictionary: Dictionary<SearchProblemResult> = _.keyBy(problemArray, 'path');

                setProblemDictionary({
                    problems: problemDictionary
                });
                break;
            }
            case ProblemBrowserSearchType.PRIVATE: {
                const result = await catalog();
                const problemArray: Array<SearchProblemResult> = result.data.data.problems.map((problem: string) => ({
                    path: problem,
                    meta: {
                        type: ProblemBrowserSearchType.PRIVATE,
                    }
                }));

                const problemDictionary: Dictionary<SearchProblemResult> = _.keyBy(problemArray, 'path');

                setProblemDictionary({
                    problems: problemDictionary,
                });
                break;
            }
            case ProblemBrowserSearchType.COURSE: {
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
                const allProblems = _.flatMap(result.data.data.problems, (problem =>
                    [
                        // Include the original problem
                        problem,
                        // create new problems for each additional problem path
                        ..._.map(problem.courseQuestionAssessmentInfo?.additionalProblemPaths, additionalProblemPath => ({
                            // This problem is the original problem
                            ...problem,
                            // with the path switched with each additional path
                            webworkQuestionPath: additionalProblemPath
                        }))
                    ]
                ));
                const problemObjects = allProblems.map((problem) => ({
                    path: problem.webworkQuestionPath,
                    meta: {
                        type: ProblemBrowserSearchType.COURSE,
                        topicName: problem.topic?.name,
                        unitName: problem.topic?.unit?.name,
                        courseName: problem.topic?.unit?.course?.name
                    }
                }));
                setProblemDictionary({
                    problems: _.keyBy(problemObjects, 'path'),
                });
                break;
            }
            default:
                logger.warn('ProblemBrowserResults: Invalid type, either a bug or someone is manipulating the url');
                setProblemDictionary({
                    problems: {}
                });
                break;
            }
        })();
    }, [searchType]);

    if (_.isNil(problems) || _.isNil(problemDictionary)) {
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
                        <Nav variant='pills' className='flex-column' defaultActiveKey={selectedProblem} style={{
                            // wordBreak: 'break-word'
                            // display: 'block'
                        }}>
                            {/* {problems.map(problem => ProblemNavItem({problemPath: problem.path, onSelect: (path: string) => setSelectedProblem(path)}))} */}
                            {problems.map(problem => <ProblemNavItem key={problem.path} problemPath={problem.path} onSelect={(path: string) => setSelectedProblem(path)} /> )}
                        </Nav>
                    </Col>
                    <Col md={9}>
                        <ProblemStateProvider>
                            {!_.isNil(selectedProblem) && !_.isNil(problemDictionary.problems[selectedProblem]) &&
                                <>
                                    <ProblemBrowserHeader
                                        path={selectedProblem}
                                        meta={problemDictionary.problems[selectedProblem].meta}
                                    />
                                    <ProblemIframe 
                                        problem={new ProblemObject()} 
                                        previewPath={selectedProblem}
                                        previewSeed={1}
                                        setProblemStudentGrade={() => {}}
                                        readonly={false} /> 
                                </>
                            }
                        </ProblemStateProvider>
                    </Col>
                </Row>
            </Container>
        </>
    );
};
