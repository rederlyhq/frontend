import React, { useState } from 'react';
import { Spinner, Row, Alert } from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';
import { CourseObject } from '../CourseInterfaces';
import ActiveTopics from '../CourseDetailsTabs/ActiveTopics';
import _ from 'lodash';
import { CourseDetailsForm } from '../CourseCreation/CourseDetailsForm';
import { EditToggleButton } from '../../Components/EditToggleButton';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import { CookieEnum } from '../../Enums/CookieEnum';
import Cookies from 'js-cookie';

interface CourseDetailsTabProps {
    course?: CourseObject;
    loading: boolean;
    error: string | null;
}

export const CourseDetailsTab: React.FC<CourseDetailsTabProps> = ({ course, loading, error} ) => {
    const [inEditMode, setInEditMode] = useState<boolean>(false);
    const userType: UserRole = getUserRole(Cookies.get(CookieEnum.USERTYPE));

    if (_.isNil(course)) {
        return <></>;
    }

    if (loading) {
        return (
            <Row style= {{display: 'flex', justifyContent: 'center', padding: '15px' }}>
                <Spinner animation='border' role='status'>
                    <span className='sr-only'>Loading...</span>
                </Spinner>
            </Row>
        );
    }

    if(!_.isNil(error)) {
        return <Alert variant="danger">{error}</Alert>;
    }
    return (
        <>
            {userType !== UserRole.STUDENT && (
                <Row>
                    <EditToggleButton
                        selectedState={inEditMode}
                        onClick={() => {setInEditMode(!inEditMode); }}
                        style={{
                            marginLeft: 'auto',
                            padding: '20px'
                        }}
                    />
                </Row>
            )}
            <CourseDetailsForm disabled={!inEditMode} course={course} updateCourseValue={() => {}} />
            <h5>Open Topics</h5>
            <DragDropContext onDragEnd={()=>{}}>
                <ActiveTopics course={course} />
            </DragDropContext>            
        </>
    );
};
