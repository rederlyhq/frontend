import { Drawer, Grid } from '@material-ui/core';
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MaterialTriSelect from '../../Components/MaterialTriSelect';
import { useCourseContext } from '../CourseProvider';
import { ExtensionsForm } from './ExtensionsForm';
import { UnitObject, UserObject, TopicObject, ProblemObject, CourseObject } from '../CourseInterfaces';
import useQuerystringHelper, { QueryStringMode } from '../../Hooks/useQuerystringHelper';
import * as qs from 'querystring';

import './ExtensionsPage.css';
import _ from 'lodash';
import { ParsedUrlQuery } from 'querystring';
import logger from '../../Utilities/Logger';

interface ExtensionsPageProps {

}

const getDefaultState = (course: CourseObject, users: UserObject[], queryStrings: ParsedUrlQuery) => {
    const unitIdStr = typeof queryStrings?.unitId === 'string' ? queryStrings?.unitId : queryStrings?.unitId?.first;
    const topicIdStr = typeof queryStrings?.topicId === 'string' ? queryStrings?.topicId : queryStrings?.topicId?.first;
    const problemIdStr = typeof queryStrings?.problemId === 'string' ? queryStrings?.problemId : queryStrings?.problemId?.first;
    const userIdStr = typeof queryStrings?.userId === 'string' ? queryStrings?.userId : queryStrings?.userId?.first;
    
    let unit: UnitObject | undefined;
    if (!_.isNil(unitIdStr)) {
        const unitId = parseInt(unitIdStr, 10);
        unit = course.findUnit(unitId);
    }

    let topic: TopicObject | undefined;
    if (!_.isNil(topicIdStr)) {
        const topicId = parseInt(topicIdStr, 10);
        if (!_.isNil(unit)) {
            topic = unit.findTopic(topicId);
        } else {
            topic = course.findTopic(topicId);
        }
    }
    
    let problem: ProblemObject | undefined;
    if (!_.isNil(problemIdStr)) {
        const problemId = parseInt(problemIdStr, 10);
        if (!_.isNil(topic)) {
            problem = topic.findProblem(problemId);
        } else {
            logger.warn(`Extensions: Problem ID (${problemIdStr}) was selected but no topic has been selected.`);
        }
    }

    let user: UserObject | undefined;
    if (!_.isNil(userIdStr)) {
        const userId = parseInt(userIdStr, 10);
        user = _.find(users, ['id', userId]);
    }

    return {unit: unit, topic: topic, problem: problem, user: user};
};

export const ExtensionsPage: React.FC<ExtensionsPageProps> = () => {
    const getCurrentQueryStrings = useCallback(() => qs.parse(window.location.search.substring(1)), []);
    const {course, users} = useCourseContext();

    const [selected, setSelected] = useState<{
        unit?: UnitObject, 
        topic?: TopicObject, 
        problem?: ProblemObject, 
        user?: UserObject
    }>({});
    
    useEffect(()=>{
        const querystrings = getCurrentQueryStrings();
        const state = getDefaultState(course, users, querystrings);
        setSelected(state);
    }, [course, users, getCurrentQueryStrings]);

    return (
        <Container style={{marginBottom: (selected.user && selected.topic) ? '25rem' : undefined}}>
            <Row>
                <Col className='text-center'>
                    <h1>Extensions</h1>
                </Col>
            </Row>
            <MaterialTriSelect course={course} users={users} selected={selected} setSelected={setSelected} />
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
                        { selected.user && (
                            <ExtensionsForm topic={selected?.topic} userId={selected.user.id} problem={selected?.problem} />
                        )}
                    </Grid>
                </Grid>
            </Drawer>
        </Container>
    );
};

export default ExtensionsPage;