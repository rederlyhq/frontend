import { Drawer, Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MaterialTriSelect from '../../Components/MaterialTriSelect';
import { useCourseContext } from '../CourseProvider';
import { OverridesForm } from './OverridesForm';
import { CourseObject, UnitObject, UserObject, NewCourseTopicObj, ProblemObject, SettingsComponentType } from '../CourseInterfaces';

import './SettingsPage.css';

interface SettingsPageProps {

}

export const SettingsPage: React.FC<SettingsPageProps> = ({}) => {
    const {course, setCourse, users, setUsers} = useCourseContext();
    const [selected, setSelected] = useState<{
        unit: UnitObject | undefined, topic: NewCourseTopicObj | undefined, problem: ProblemObject | undefined, user: UserObject | undefined
    }>({unit: undefined, topic: undefined, problem: undefined, user: undefined});

    return (
        <Container>
            <Row>
                <Col className='text-center'>
                    <h1>Course/Individual Settings</h1>
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
                            <OverridesForm topic={selected?.topic} userId={selected.user.id} problem={selected?.problem} />
                        )}
                    </Grid>
                </Grid>
            </Drawer>
        </Container>
    );
};

export default SettingsPage;