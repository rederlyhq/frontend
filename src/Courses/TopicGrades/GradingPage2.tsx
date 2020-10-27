import { Drawer, Grid } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MaterialBiSelect from '../../Components/MaterialBiSelect';
import { useCourseContext } from '../CourseProvider';
import { UserObject, TopicObject, ProblemObject, StudentWorkbookInterface, ProblemDict } from '../CourseInterfaces';
import _ from 'lodash';

import './SettingsPage.css';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { getAssessmentProblemsWithWorkbooks } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { useParams } from 'react-router-dom';
import logger from '../../Utilities/Logger';

interface TopicGradingPageProps {
    topicId?: string;
    courseId?: string;
}

export const TopicGradingPage: React.FC<TopicGradingPageProps> = () => {
    const params = useParams<TopicGradingPageProps>();
    const {course, users} = useCourseContext();
    const [problemMap, setProblems] = useState<Record<number, ProblemDict>>({});
    const [workbooks, setWorkbooks] = useState<Record<number, StudentWorkbookInterface>>({});
    const [selected, setSelected] = useState<{
        topic?: TopicObject, 
        problem?: ProblemObject, 
        workbook?: StudentWorkbookInterface,
        user?: UserObject
    }>({});

    useEffect(() => {
        (async () => {
            try {
                if (_.isNil(params.topicId)) {
                    logger.error('topicId is null');
                    throw new Error('An unexpected error has occurred');
                } else {
                    await fetchProblems(parseInt(params.topicId, 10));
                }
            } catch (e) {
                logger.error(e.message, e);
            }
        })();
    }, [params.topicId]);

    useEffect(() => {
        if (!_.isNil(selected.problem) && !_.isNil(selected.user)) {
            if (!_.isNil(selected.problem.id) && !_.isNil(selected.user.id)) {
                const problemDict = problemMap[selected.problem.id];
                if (!_.isNil(problemDict.grades)) {
                    const userGrade = problemDict.grades[selected.user.id];
                    const userProblemWorkbooks = userGrade.workbooks;
                    const selectedWorkbookId = userGrade.lastInfluencingAttemptId;
                    if (!_.isNil(userProblemWorkbooks)) {
                        setWorkbooks(userProblemWorkbooks);
                        if (!_.isNil(selectedWorkbookId)) {
                            const selectedWorkbook = workbooks[selectedWorkbookId];
                            if (!_.isNil(selectedWorkbook)) {
                                setSelected({ workbook: selectedWorkbook });
                            } else {
                                logger.error(`we were supposed to get workbook #${selectedWorkbookId}, but failed.`);
                            }
                        } else {
                            logger.error(`student #${selected.user.id} has workbooks for problem #${selected.problem.id} but no target-able id`);
                        }
                    }
                }
            }
        }
    }, [selected.problem, selected.user]);

    const fetchProblems = async (topicId: number) => {
        const res = await getAssessmentProblemsWithWorkbooks({ topicId });
        const problems: Array<ProblemObject> = res.data.data.questions;

        const currentTopic = res.data.data.topic;

        if (currentTopic.studentTopicOverride?.length > 0) {
            _.assign(currentTopic, currentTopic.studentTopicOverride[0]);
        }

        if (!_.isEmpty(problems)) {
            // const problemDictionary = deepKeyBy(problems, 'id') as Record<number, ProblemObject>;
            // https://stackoverflow.com/questions/40937961/lodash-keyby-for-multiple-nested-level-arrays
            const problemDictionary = _(problems)
                .map( (obj) => {
                    return _.mapValues(obj, (val) => {
                        if (_.isArray(val)) {
                            return _(val)
                                .map((obj) => {
                                    return _.mapValues(obj, (val) => {
                                        if (_.isArray(val)) {
                                            return _.keyBy(val, 'id');
                                        } else {
                                            return val;
                                        }
                                    });
                                })
                                .keyBy('userId')
                                .value();
                        } else {
                            return val;
                        }
                    });
                })
                .keyBy('id')
                .value() as Record<number, ProblemDict>;
            setProblems(problemDictionary);
            const initialSelectedProblemId = _.sortBy(problems, ['problemNumber'], ['asc'])[0].id;
            setSelected({ topic: currentTopic, problem: problemDictionary[initialSelectedProblemId]});
        } else { 
            // setError('No problems in this topic.');
            setSelected({ topic: currentTopic });
        }
    };

    return (
        <Container style={{marginBottom: (selected.user && selected.topic) ? '25rem' : undefined}}>
            <Row>
                <Col className='text-center'>
                    <h1>Extensions</h1>
                </Col>
            </Row>
            <MaterialBiSelect course={course} users={users} selected={selected} setSelected={setSelected} />
            <Drawer 
                className='black-drawer'
                anchor='bottom' 
                open={!!(selected.user && selected.topic)} 
                onClose={()=>{}}
                variant="persistent"
                SlideProps={{style: {height: '20rem', backgroundColor: 'rgb(52, 58, 64)', color: 'rgba(255, 255, 255, 0.8)'}}}
            >
                <Grid container>
                    <Grid container item>
                        { selected.problem && selected.workbook && (
                            < ProblemIframe
                                problem={problemMap[selected.problem.id]}
                                readonly={true}
                                workbookId={selected.workbook.id}
                            />
                        )}
                    </Grid>
                </Grid>
            </Drawer>
        </Container>
    );
};

export default TopicGradingPage;