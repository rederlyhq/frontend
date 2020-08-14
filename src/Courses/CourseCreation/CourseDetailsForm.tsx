import React from 'react';
import { Col, Row, FormControl, FormLabel, FormGroup } from 'react-bootstrap';
import { CourseObject } from '../CourseInterfaces';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker} from '@material-ui/pickers';

import './Course.css';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

interface CourseDetailsProps {
    course: CourseObject;
    updateCourseValue?:  (field: keyof CourseObject, e: any) => void;
    disabled?: boolean;
}

export const CourseDetailsForm: React.FC<CourseDetailsProps> = ({ course, updateCourseValue = () => {}, disabled = false }) => {
    return (
        <>
            <fieldset disabled={disabled} className="course-details-form-fieldset">
                <FormGroup controlId='course-name'>
                    <Row>
                        <Col>
                            <FormLabel>
                                <h3>Course Name: </h3>
                            </FormLabel>
                            <FormControl 
                                required
                                size='lg' 
                                defaultValue={course?.name || ''}
                                onChange={(e: any) => updateCourseValue('name', e)}
                                onBlur={(e: any) => updateCourseValue('name', e)}
                            />
                        </Col>
                    </Row>
                </FormGroup>
                <Row>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Col>
                            <h4>Start Date</h4>
                            <KeyboardDatePicker
                                disabled={disabled}
                                variant="inline"
                                format="MM/DD/yyyy"
                                name={'start-date'}
                                defaultValue={course.start}
                                value={course.start}
                                onChange={() => {}}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    const e = {target: {value: date.toDate()}};
                                    updateCourseValue('start', e);
                                }}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                                fullWidth={true}
                                InputLabelProps={{shrink: false}}
                                inputProps={{style: {textAlign: 'center'}}}
                            />
                        </Col>
                        <Col>
                            <h4>End Date</h4>
                            <KeyboardDatePicker
                                disabled={disabled}
                                variant="inline"
                                format="MM/DD/yyyy"
                                name={'end-date'}
                                defaultValue={course.end}
                                value={course.end}
                                onChange={() => {}}
                                onAccept={(date: MaterialUiPickersDate) => {
                                    if (!date) return;
                                    const e = {target: {value: date.toDate()}};
                                    updateCourseValue('end', e);
                                }}
                                KeyboardButtonProps={{
                                    'aria-label': 'change date',
                                }}
                                fullWidth={true}
                                InputLabelProps={{shrink: false}}
                                inputProps={{style: {textAlign: 'center'}}}
                            />
                        </Col>
                    </MuiPickersUtilsProvider>
                </Row>
                <Row>
                    <Col md={6}>
                        <FormGroup controlId='section-code'>
                            <FormLabel>
                                <h4>Section Code:</h4>
                            </FormLabel>
                            <FormControl type='text' placeholder='MAT120' 
                                required
                                defaultValue={course.sectionCode}
                                onChange={(e: any) => updateCourseValue('sectionCode', e)}/>
                        </FormGroup>
                    </Col>
                    <Col md={3}>
                        <FormGroup controlId='semester-code'>
                            <FormLabel>
                                <h4>Semester:</h4>
                            </FormLabel>
                            <FormControl 
                                as='select'
                                type='number'
                                required
                                defaultValue={course.semesterCode}
                                onChange={(e: any) => updateCourseValue('semesterCode', e)}
                            >
                                <option>FALL</option>
                                <option>WINTER</option>
                                <option>SPRING</option>
                                <option>SUMMER</option>
                            </FormControl>
                        </FormGroup>
                    </Col>
                    <Col md={3}>
                        <FormGroup controlId='semester-code-year'>
                            <FormLabel>
                                <h4>Semester Year:</h4>
                            </FormLabel>
                            <FormControl 
                                type='number'
                                placeholder='2020'
                                defaultValue={course.semesterCodeYear}
                                required
                                onChange={(e: any) => updateCourseValue('semesterCodeYear', e)}/>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <FormGroup as={Col} controlId='section-code'>
                        <FormLabel>
                            <h4>Textbooks:</h4>
                        </FormLabel>
                        <FormControl as='textarea'
                            defaultValue={course.textbooks} 
                            required
                            onChange={(e: any) => updateCourseValue('textbooks', e)}/>
                    </FormGroup>
                </Row>
            </fieldset>
        </>
    );
};