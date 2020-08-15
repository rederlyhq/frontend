import React, { useState } from 'react';
import { Col, Row, FormControl, FormLabel, FormGroup } from 'react-bootstrap';
import { CourseObject } from '../CourseInterfaces';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, KeyboardDatePicker} from '@material-ui/pickers';
import _ from 'lodash';
import moment from 'moment';

import './Course.css';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { FormControlProps } from '@material-ui/core';

interface CourseDetailsProps {
    course: CourseObject;
    updateCourseValue?:  (field: keyof CourseObject, value: any) => void;
    disabled?: boolean;
    onBlur?: ((field: keyof CourseObject, value: any) => void)
}

export const CourseDetailsForm: React.FC<CourseDetailsProps> = ({ course, updateCourseValue: updateCourseValueProp = () => {}, disabled = false, onBlur }) => {
    const [currentCourseState, setCurrentCourseState] = useState<CourseObject>(new CourseObject());

    const onTextInputBlurForCourseField = (field: keyof CourseObject, event: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(field, event.target.value);
    };
    const curriedOnTextInputBlurForCourseField = _.curry(onTextInputBlurForCourseField, 2);

    const updateCourseValue = (field: keyof CourseObject, value: any) => {
        setCurrentCourseState({...currentCourseState, [field]: value});
        updateCourseValueProp?.(field, value);
    };

    const onTextInputChanged = (field: keyof CourseObject, e: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | Date = e.target.value;
        if (field === 'start' || field === 'end') {
            value = moment(value).toDate();
        }
        updateCourseValue(field, value);
    };

    const curriedOnTextInputChanged = _.curry(onTextInputChanged, 2);

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
                                onChange={curriedOnTextInputChanged('name')}
                                onBlur={curriedOnTextInputBlurForCourseField('name')}
                            />
                        </Col>
                    </Row>
                </FormGroup>
                <Row>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <Col>
                            <h4>Start Date</h4>
                            <KeyboardDatePicker
                                autoOk
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
                                    curriedOnTextInputChanged('start')(e as any);
                                }}
                                onBlur={curriedOnTextInputBlurForCourseField('start')}
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
                                autoOk
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
                                    curriedOnTextInputChanged('end')(e as any);
                                }}
                                onBlur={curriedOnTextInputBlurForCourseField('end')}
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
                                onChange={curriedOnTextInputChanged('sectionCode')}
                                onBlur={curriedOnTextInputBlurForCourseField('sectionCode')}
                            />
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
                                onChange={curriedOnTextInputChanged('semesterCode')}
                                onBlur={curriedOnTextInputBlurForCourseField('semesterCode')}
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
                                onChange={curriedOnTextInputChanged('semesterCodeYear')}
                                onBlur={curriedOnTextInputBlurForCourseField('semesterCodeYear')}
                            />
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
                            onChange={curriedOnTextInputChanged('textbooks')}
                            onBlur={curriedOnTextInputBlurForCourseField('textbooks')}
                        />
                    </FormGroup>
                </Row>
            </fieldset>
        </>
    );
};