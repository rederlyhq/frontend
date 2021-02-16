import React, { useState } from 'react';
import { Spinner, Col, Row, Alert } from 'react-bootstrap';
import { DragDropContext } from 'react-beautiful-dnd';
import { CourseObject } from '../CourseInterfaces';
import ActiveTopics from '../CourseDetailsTabs/ActiveTopics';
import _ from 'lodash';
import { EditToggleButton } from '../../Components/EditToggleButton';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import { nameof } from '../../Utilities/TypescriptUtils';
import { EditableCourseDetailsForm } from '../CourseCreation/EditableCourseDetailsForm';
import { putCourse } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../../Utilities/Logger';
import { Alert as MUIAlert } from '@material-ui/lab';
import { Link } from 'react-router-dom';
import * as qs from 'querystring';
import useQuerystringHelper, { QueryStringMode } from '../../Hooks/useQuerystringHelper';

interface CourseDetailsTabProps {
    course?: CourseObject;
    loading: boolean;
    error: string | null;
    setCourse?: React.Dispatch<React.SetStateAction<CourseObject>>;
}

export const CourseDetailsTab: React.FC<CourseDetailsTabProps> = ({ course, loading, error, setCourse} ) => {
    const {getCurrentQueryStrings, updateRoute} = useQuerystringHelper();
    const [inEditMode, setInEditMode] = useState<boolean>(getUserRole() !== UserRole.STUDENT && getCurrentQueryStrings()['edit'] === 'true');
    const [updateError, setUpdateError] = useState<string | null>(null);
    const userType: UserRole = getUserRole();



    const setInEditModeWrapper = (newEditMode: boolean) => {
        let val = newEditMode;
        if (getUserRole() === UserRole.STUDENT) {
            val = false;
        }

        setInEditMode(val);
        updateRoute({
            edit: {
                val: val ? 'true' : null,
                mode: QueryStringMode.OVERWRITE,
            },
        }, true);
    };

    const onCourseDetailsBlur = async (field: keyof CourseObject, value: any) => {
        if(_.isNil(course)) {
            return;
        }

        // TODO, the form gives strings and we aren't validating type properly
        if(course[field].toString() !== value.toString() && value.toString() !== '') {
            const courseObjectWithUpdates = new CourseObject(course);
            (courseObjectWithUpdates as any)[field] = value;
            if(field === nameof<CourseObject>('semesterCodeYear')) {
                field = 'semesterCode';
            }
            const postObject = _.pick(CourseObject.toAPIObject(courseObjectWithUpdates), field);
            try {
                setUpdateError(null);
                const result = await putCourse({
                    id: course.id,
                    data: postObject
                });
                setCourse?.(new CourseObject({
                    ...result.data.data.updatesResult?.[0],
                    units: course.units
                }));
            } catch (e) {
                logger.error('update course failed', e);
                setUpdateError(e.message);
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

    const unitsWithErrors: number[] = [];
    const hasErrors = _.sumBy(course.units, unit => {
        const errorsInUnit = _.sumBy(unit.topics, 'errors');
        if (errorsInUnit > 0) unitsWithErrors.push(unit.id);
        return errorsInUnit;
    });

    return (
        <>
            <div
                style={{
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    display: 'flex',
                }}
            >
                <h2>Course Details</h2>
                {userType !== UserRole.STUDENT &&
                <div
                    style={{
                        marginLeft: 'auto'
                    }}
                >
                    {hasErrors > 0 && 
                        <Col>
                            <Link to={`/common/courses/${course.id}?${qs.stringify({tab: 'Topics', unitId: unitsWithErrors})}`}>
                                <MUIAlert severity='warning'>
                                    There are <b>{hasErrors}</b> issues across <b>{unitsWithErrors.length}</b> units.
                                </MUIAlert>
                            </Link>
                        </Col>
                    }
                    <EditToggleButton
                        selectedState={inEditMode}
                        onClick={() => {setInEditModeWrapper(!inEditMode); }}
                        style={{
                            marginLeft: 'auto',
                            padding: '2px'
                        }}
                    />
                </div>
                }
            </div>

            {updateError && <Alert variant="danger">{updateError}</Alert>}
            <EditableCourseDetailsForm disabled={!inEditMode} course={course} onBlur={onCourseDetailsBlur} />
            <h5>Open Topics</h5>
            <DragDropContext onDragEnd={()=>{}}>
                <ActiveTopics course={course} />
            </DragDropContext>
        </>
    );
};
