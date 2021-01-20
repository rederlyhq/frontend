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
import { Snackbar } from '@material-ui/core';
import { useMUIAlertState } from '../Hooks/useAlertState';
import { Alert as MUIAlert } from '@material-ui/lab';
import { FixedSizeList, ListChildComponentProps } from 'react-window'; 
import AutoSizer from 'react-virtualized-auto-sizer';

const urlJoin: (...args: string[]) => string = require('url-join');

interface ProblemBrowserResultsProps {

}

interface ProblemNavItemOptions {
    problemPath: string;
    onSelect: (path: string) => unknown;
}

const ProblemNavItem: React.FC<ProblemNavItemOptions> = ({
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
            <h5 style={{
                // wordBreak: 'break-all',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>{nodePath.basename(problemPath)}</h5>
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
    const [updateAlert, setUpdateAlert] = useMUIAlertState();

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
            try {
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
            } catch (e) {
                logger.error(e);
                setUpdateAlert({message: e.message, severity: 'error'});
                setProblemDictionary({
                    problems: {}
                });
            }
        })();
    }, [searchType]);

    if (_.isNil(problems) || _.isNil(problemDictionary)) {
        return <div>Loading...</div>;
    }

    if (_.isEmpty(problems)) {
        return <div>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={updateAlert.message !== ''}
                autoHideDuration={updateAlert.severity === 'success' ? 6000 : undefined}
                // onClose={() => setUpdateAlert(alertState => ({...alertState, message: ''}))}
                style={{maxWidth: '50vw'}}
            >
                <MUIAlert
                    // onClose={() => setUpdateAlert(alertState => ({...alertState, message: ''}))}
                    severity={updateAlert.severity}
                    variant='filled'
                    style={{fontSize: '1.1em'}}
                >
                    {updateAlert.message}
                </MUIAlert>
            </Snackbar>
            There are no problems to display
        </div>;
    }

    if (_.isNil(selectedProblem)) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {/* {alert.message !== '' && <Alert severity={alert.severity}>{alert.message}</Alert>} */}
            <Container fluid style={{
                position: 'absolute',
                top: '137px',
                bottom: '35px',
                left: 0,
                right: 0,
                overflow: 'auto',
            }}>
                <Row style={{
                    height: '100%'
                }}>
                    <Col md={3} style={{
                        height: '100%',
                        overflowY: 'auto',
                    }}>
                        <Nav variant='pills' className='flex-column' defaultActiveKey={selectedProblem} style={{
                            // wordBreak: 'break-word'
                            // display: 'block'
                            height: '100%',
                            width: '100%'
                        }}>
                            <AutoSizer>
                                {({ height, width }) => (
                                    <FixedSizeList
                                        // className='List'
                                        height={height}
                                        width={width}
                                        itemCount={problems.length}
                                        itemSize={100}
                                    >
                                        {({index, style}: ListChildComponentProps) => (
                                            <div
                                                style={style}
                                            >
                                                <ProblemNavItem key={problems[index].path} problemPath={problems[index].path} onSelect={(path: string) => setSelectedProblem(path)} />
                                            </div>
                                        )}
                                    </FixedSizeList>
                                )}
                            </AutoSizer>
                        </Nav>
                    </Col>
                    <Col md={9} style={{
                        height: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}>
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
