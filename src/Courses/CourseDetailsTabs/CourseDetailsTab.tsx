import React from 'react';
import { Spinner, Row, Alert } from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';
import { CourseObject } from '../CourseInterfaces';
import ActiveTopics from '../CourseDetailsTabs/ActiveTopics';
import _ from 'lodash';
import { CourseDetailsForm } from '../CourseCreation/CourseDetailsForm';
import {
    FaPencilAlt
} from 'react-icons/fa';
import { ComponentToggleButton } from '../../Components/ComponentToggleButton';

interface CourseDetailsTabProps {
    course?: CourseObject;
    loading: boolean;
    error: string | null;
}

export const CourseDetailsTab: React.FC<CourseDetailsTabProps> = ({ course, loading, error} ) => {
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
            <Row>
                <ComponentToggleButton
                    defaultSelectedState={true}
                    // selectedState={false}
                    selectedStateJSX={ <FaPencilAlt color="#007bff" style={{float:'right'}} /> }
                    notSelectedStateJSX={ <FaPencilAlt style={{float:'right'}} /> }
                    style={{
                        marginLeft: 'auto',
                        padding: '20px'
                    }}
                />
                {/* <FaPencilAlt color="#007bff" style={{float:'right'}} /> */}
            </Row>
            <CourseDetailsForm disabled={true} course={course} updateCourseValue={() => {}} />
            <h5>Open Topics</h5>
            <DragDropContext onDragEnd={()=>{}}>
                <ActiveTopics course={course} />
            </DragDropContext>            
        </>
    );
};
