import React from 'react';
import { Column } from 'material-table';
import moment from 'moment';

// Efficient numeric-safe sorting https://stackoverflow.com/a/38641281/4752397
const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

export const GRADES_SIMPLIFIED_HEADERS : Column<object>[]  = [
    { title: 'First Name', field: 'firstName', customSort: (x: any, y: any)  => collator.compare(x.firstName, y.firstName)},
    { title: 'Last Name', field: 'lastName', customSort: (x: any, y: any)  => collator.compare(x.lastName, y.lastName)},
    { title: 'Closed', field: 'deadAverage', customSort: (x: any, y: any) => collator.compare(x.deadAverage, y.deadAverage) },
    { title: 'Opened', field: 'openAverage', customSort: (x: any, y: any) => collator.compare(x.openAverage, y.openAverage) },
    { title: 'Total', field: 'average', customSort: (x: any, y: any) => collator.compare(x.average, y.average) },
];

export const GRADES_SIMPLIFIED_TOPICS_HEADERS : Column<object>[]  = [
    { title: 'First Name', field: 'firstName', customSort: (x: any, y: any)  => collator.compare(x.firstName, y.firstName)},
    { title: 'Last Name', field: 'lastName', customSort: (x: any, y: any)  => collator.compare(x.lastName, y.lastName)},
    { title: 'Effective Grade', field: 'average', customSort: (x: any, y: any) => collator.compare(x.average, y.average) },
    { title: 'System Grade', field: 'systemScore', customSort: (x: any, y: any) => collator.compare(x.systemScore, y.systemScore) },
];

export const GRADES_SIMPLIFIED_PROBLEM_HEADERS : Column<object>[]  = [
    { title: 'First Name', field: 'firstName', customSort: (x: any, y: any)  => collator.compare(x.firstName, y.firstName)},
    { title: 'Last Name', field: 'lastName', customSort: (x: any, y: any)  => collator.compare(x.lastName, y.lastName)},
    { title: 'Attempts', field: 'numAttempts'},
    { title: 'Effective Grade', field: 'effectiveScore', customSort: (x: any, y: any) => collator.compare(x.effectiveScore, y.effectiveScore) },
    { title: 'System Grade', field: 'systemScore', customSort: (x: any, y: any) => collator.compare(x.systemScore, y.systemScore) },
];

export const STATISTICS_SIMPLIFIED_HEADERS : Column<object>[]  = [
    { title: 'Name', field: 'name', customSort: (x: any, y: any)  => collator.compare(x.name, y.name)},
    { title: 'Average Attempts', field: 'averageAttemptedCount' },
    // { title: 'Average Closed', field: 'averageScoreDead', render: (data: any) => data.averageScoreDead?.toPercentString() ?? '--'},
    // { title: 'Average Opened', field: 'averageScoreOpen', render: (data: any) => data.averageScoreOpen?.toPercentString() ?? '--'},
    { title: 'Average Total', field: 'averageScore' },
];

export const STUDENT_STATISTICS_SIMPLIFIED_HEADERS : Column<object>[]  = [
    { title: 'Name', field: 'name', customSort: (x: any, y: any)  => collator.compare(x.name, y.name)},
    { title: 'Attempts', field: 'averageAttemptedCount' },
    { title: 'Closed', field: 'averageScoreDead', render: (data: any) => data.averageScoreDead?.toPercentString() ?? '--'},
    { title: 'Opened', field: 'averageScoreOpen', render: (data: any) => data.averageScoreOpen?.toPercentString() ?? '--'},
    { title: 'Total', field: 'averageScore' },
];

export const STUDENT_STATISTICS_SIMPLIFIED_TOPIC_HEADERS : Column<object>[]  = [
    { title: 'Name', field: 'name', customSort: (x: any, y: any)  => collator.compare(x.name, y.name)},
    { title: 'Effective Grade', field: 'averageScore', customSort: (x: any, y: any) => collator.compare(x.effectiveScore, y.effectiveScore) },
    { title: 'System Grade', field: 'systemScore', customSort: (x: any, y: any) => collator.compare(x.systemScore, y.systemScore) },
];

export const STUDENT_STATISTICS_SIMPLIFIED_PROBLEM_HEADERS : Column<object>[]  = [
    { title: 'Name', field: 'name', customSort: (x: any, y: any)  => collator.compare(x.name, y.name)},
    // { title: 'Attempts', field: 'numAttempts'},
    { title: 'Attempts', field: 'averageAttemptedCount' },
    { title: 'Effective Grade', field: 'averageScore', customSort: (x: any, y: any) => collator.compare(x.effectiveScore, y.effectiveScore) },
    { title: 'System Grade', field: 'systemScore', customSort: (x: any, y: any) => collator.compare(x.systemScore, y.systemScore) },
];

export const STUDENT_STATISTICS_ATTEMPTS_HEADERS: Array<Column<any>> = [
    { title: 'Result', field: 'result' },
    {
        title: 'Attempt Time',
        field: 'time',
        defaultSort: 'asc',
        sorting: true,
        type: 'datetime',
        render: function SpanAttemptTime(datetime: any) { return <span title={moment(datetime.time).toString()}>{moment(datetime.time).fromNow()}</span>; },
        customSort: (a: any, b: any) => moment(b.time).diff(moment(a.time))
    },
];

export const ENROLLMENT_TABLE_HEADERS: Array<Column<any>> = [
    { title: 'First Name', field: 'firstName', customSort: (x: any, y: any) => collator.compare(x.firstName, y.firstName) },
    { title: 'Last Name', field: 'lastName', customSort: (x: any, y: any) => collator.compare(x.lastName, y.lastName) },
];
