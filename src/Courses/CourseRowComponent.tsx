import React from 'react';
import { ListGroupItem, Row } from 'react-bootstrap';
import { CourseObject } from './CourseInterfaces';
import moment from 'moment';

export const CourseRowComponent: React.FC<CourseObject> = ({ course_name, course_start, course_end}) => {
    const COURSE_DATE_FORMAT = 'MMM D, YYYY';

    return (
        <>
            <Row>
                {course_name}
            </Row>
            <Row>
                {/* TODO: Timezone support? */}
                {moment(course_start).format(COURSE_DATE_FORMAT)} - {moment(course_end).format(COURSE_DATE_FORMAT)}
            </Row>
        </>
    );
};
export default CourseRowComponent;