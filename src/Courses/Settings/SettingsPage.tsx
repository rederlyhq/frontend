import { Drawer } from '@material-ui/core';
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MaterialTriSelect from '../../Components/MaterialTriSelect';
import { useCourseContext } from '../CourseProvider';

interface SettingsPageProps {

}

export const SettingsPage: React.FC<SettingsPageProps> = ({}) => {
    const {course, setter: setCourse} = useCourseContext();

    return (
        <Container>
            <Row>
                <Col className='text-center'>
                    <h1>Course/Individual Settings</h1>
                </Col>
            </Row>
            <MaterialTriSelect course={course} />
            <Drawer 
                anchor='bottom' 
                open={true} 
                onClose={()=>{}}
                variant="persistent"
            >
                TODO.
            </Drawer>
        </Container>
    );
};

export default SettingsPage;