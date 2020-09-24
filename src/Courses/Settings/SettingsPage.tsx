import { Drawer, Grid } from '@material-ui/core';
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MaterialTriSelect from '../../Components/MaterialTriSelect';
import { useCourseContext } from '../CourseProvider';

interface SettingsPageProps {

}

export const SettingsPage: React.FC<SettingsPageProps> = ({}) => {
    const {course, setCourse, users, setUsers} = useCourseContext();

    return (
        <Container>
            <Row>
                <Col className='text-center'>
                    <h1>Course/Individual Settings</h1>
                </Col>
            </Row>
            <MaterialTriSelect course={course} users={users} />
            <Drawer 
                anchor='bottom' 
                open={true} 
                onClose={()=>{}}
                variant="persistent"
            >
                <Grid container>
                    <Grid item>
                        TODO
                    </Grid>
                </Grid>
            </Drawer>
        </Container>
    );
};

export default SettingsPage;