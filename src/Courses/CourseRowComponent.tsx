import React from 'react';
import { Row } from 'react-bootstrap';
import { CourseObject } from './CourseInterfaces';
import moment from 'moment';

export const CourseRowComponent: React.FC<CourseObject> = ({ name, start, end}) => {
    const COURSE_DATE_FORMAT = 'MMM D, YYYY';

    return (
        <>
            <Row>
                {name}
            </Row>
            <Row>
                {/* TODO: Timezone support? */}
                {moment(start).format(COURSE_DATE_FORMAT)} - {moment(end).format(COURSE_DATE_FORMAT)}
            </Row>
        </>
    );
};
export default CourseRowComponent;