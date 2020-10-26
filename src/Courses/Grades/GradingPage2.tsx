import { Drawer, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MaterialBiSelect from '../../Components/MaterialBiSelect';
import { useCourseContext } from '../CourseProvider';
import { CourseObject, UnitObject, UserObject, TopicObject, ProblemObject, SettingsComponentType, StudentWorkbookInterface } from '../CourseInterfaces';
import _ from 'lodash';

import './SettingsPage.css';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { getAssessmentProblemsWithWorkbooks } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';

interface SettingsPageProps {

}

export const SettingsPage: React.FC<SettingsPageProps> = () => {
    const {course, users} = useCourseContext();
    const [problemMap, setProblems] = useState<Record<number, ProblemObject>>({});
    const [selected, setSelected] = useState<{
        topic?: TopicObject, 
        problem?: ProblemObject, 
        workbook?: StudentWorkbookInterface,
        user?: UserObject
    }>({});

    // https://stackoverflow.com/questions/40937961/lodash-keyby-for-multiple-nested-level-arrays
    const deepKeyBy = (arr: Array<any>, key: string): Record<number, any> => {
        return _(arr)
            .map(function (o) {
                return _.mapValues(o, function (v) {
                    return _.isArray(v) ? deepKeyBy(v, key) : v;
                });
            })
            .keyBy(key)
            .value();
    };

    const fetchProblems = async (topicId: number) => {
        const res = await getAssessmentProblemsWithWorkbooks({ topicId });
        const problems: Array<ProblemObject> = res.data.data.questions;

        const currentTopic = res.data.data.topic;

        if (currentTopic.studentTopicOverride?.length > 0) {
            _.assign(currentTopic, currentTopic.studentTopicOverride[0]);
        }
        setSelected({topic: currentTopic});

        if (!_.isEmpty(problems)) {
            const problemDictionary = deepKeyBy(problems, 'id') as Record<number, ProblemObject>;
            setProblems(problemDictionary);
            // setSelectedProblemId(_.minBy(problems, 'problemNumber').id);
        } else { // we are definitely an assessment - topicAssessmentInfo *should* never be missing
            setError('No problems in this topic.');
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

export default SettingsPage;