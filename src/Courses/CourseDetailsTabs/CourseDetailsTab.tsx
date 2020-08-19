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
import AxiosRequest from '../../Hooks/AxiosRequest';
import { nameof } from '../../Utilities/TypescriptUtils';
import { EditableCourseDetailsForm } from '../CourseCreation/EditableCourseDetailsForm';

interface CourseDetailsTabProps {
    course?: CourseObject;
    loading: boolean;
    error: string | null;
    setCourse?: (course: CourseObject) => void;
}

export const CourseDetailsTab: React.FC<CourseDetailsTabProps> = ({ course, loading, error, setCourse} ) => {
    const [inEditMode, setInEditMode] = useState<boolean>(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const userType: UserRole = getUserRole();

    const onCourseDetailsBlur = async (field: keyof CourseObject, value: any) => {
        if(_.isNil(course)) {
            return;
        }

        // TODO, the form gives strings and we aren't validating type properly
        if(course[field].toString() !== value.toString()) {
            let courseObjectWithUpdates = new CourseObject(course);
            (courseObjectWithUpdates as any)[field] = value;
            if(field === nameof<CourseObject>('semesterCodeYear')) {
                field = 'semesterCode';
            }
            const postObject = _.pick(CourseObject.toAPIObject(courseObjectWithUpdates), field);
            try {
                setUpdateError(null);
                const result = await AxiosRequest.put(`/courses/${course.id}`, postObject);
                setCourse?.(new CourseObject({
                    ...result.data.data.updatesResult?.[0],
                    units: course.units
                }));
            } catch (e) {
                console.error(e);
                setUpdateError(`An error has occurred ${e.response.data.message}`);
            }
        }
    };

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

            {updateError && <Alert variant="danger">{updateError}</Alert>}
            <EditableCourseDetailsForm disabled={!inEditMode} course={course} onBlur={onCourseDetailsBlur} />
            <h5>Open Topics</h5>
            <DragDropContext onDragEnd={()=>{}}>
                <ActiveTopics course={course} />
            </DragDropContext>            
        </>
    );
};
