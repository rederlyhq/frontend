import React, { useRef, useEffect, useState } from 'react';
import { ProblemObject, NewCourseTopicObj } from '../Courses/CourseInterfaces';
import AxiosRequest from '../Hooks/AxiosRequest';
import { fromEvent } from 'from-form-submit';
import _ from 'lodash';
import moment from 'moment';
import { Spinner, Row, Col } from 'react-bootstrap';

interface ProblemDetailsProps {
    problem: ProblemObject;
    topic: NewCourseTopicObj | null;
    // setProblemStudentGrade: (val: any) => void;
}


const renderCell = (key: string, value?: string | null) => {
    return (
        <Col style={{
            paddingBottom: '25px',
            paddingRight: '25px'
        }}>
            {!_.isNil(value) && (
                <>
                    <Row>
                        <h6>{key}</h6>
                    </Row>
                    <Row>
                        {value}
                    </Row>
                </>
            )}
        </Col>
    );
};

const renderAvailableDate = (startDate?: Date) => {
    return renderCell('Available Date', startDate && moment(startDate).format('LLLL'));
};

const renderDueDate = (endDate?: Date) => {
    return renderCell('Due Date', endDate && moment(endDate).format('LLLL'));
};

const renderDeadDate = (deadDate?: Date | null, endDate?: Date) => {
    // If an end date is provided, we are not past that end date, and the end date does not match partial credit date
    if (
        !_.isNil(deadDate) &&
        !_.isNil(endDate) &&
        (
            moment().isBefore(moment(endDate)) ||
            moment(endDate).isSame(moment(deadDate))
        )
    ) {
        deadDate = null;
    }
    return renderCell('Partial Credit Due Date', deadDate && moment(deadDate).format('LLLL'));
};

const renderTimeRemaining = (endDate?: Date, deadDate?: Date) => {
    if (_.isNil(deadDate) || _.isNil(endDate)) {
        return (<></>);
    }
    const limit = moment.max(moment(endDate), moment(deadDate));

    return renderCell('Time Remaining', `Due ${limit.fromNow()}`);
};

const renderCurrentGrade = (grade?: number) => {
    return renderCell('Current Grade', _.isNil(grade) ? null : `${(grade * 100).toFixed(1)}%`);
};

const renderBestScore = (grade?: number) => {
    return renderCell('Best Score', _.isNil(grade) ? null : `${(grade * 100).toFixed(1)}%`);
};

const renderUsedAttempts = (numAttempts?: number) => {
    return renderCell('Number of Attempts', numAttempts?.toString());
};

const renderWeight = (weight?: number) => {
    return renderCell('Weight', weight?.toString());
};

const renderMaxAttempts = (numAttempts?: number) => {
    let value = numAttempts?.toString();
    if (!_.isNil(numAttempts) && numAttempts < 0) {
        value = 'NA';
    }
    return renderCell('Max Number of Attempts', value);
};

const renderRemainingAttempts = (numAttempts?: number, maxAttempts?: number) => {
    let value: number | null;
    if (_.isNil(numAttempts) || _.isNil(maxAttempts) ||  maxAttempts < 0) {
        value = null;
    } else {
        value = maxAttempts - numAttempts;
    }
    return renderCell('Remaining Attempts', value?.toString());
};

export const ProblemDetails: React.FC<ProblemDetailsProps> = ({
    problem,
    topic,
}) => {
    return (
        <>
            <Row>
                {renderAvailableDate(topic?.startDate)}
                {renderDueDate(topic?.endDate)}
                {renderDeadDate(topic?.deadDate, topic?.endDate)}
                {renderTimeRemaining(topic?.endDate, topic?.deadDate)}
            </Row>
            <Row>
                {renderWeight(problem.weight)}
                {renderMaxAttempts(problem.maxAttempts)}
                {renderUsedAttempts(problem?.grades?.[0].numAttempts)}
                {renderRemainingAttempts(problem?.grades?.[0].numAttempts, problem.maxAttempts)}
            </Row>
            <Row>
                {renderCurrentGrade(problem?.grades?.[0].effectiveScore)}
                {renderBestScore(problem?.grades?.[0].overallBestScore)}
                {renderCell('', null)}
                {renderCell('', null)}
            </Row>
        </>
    );
};
