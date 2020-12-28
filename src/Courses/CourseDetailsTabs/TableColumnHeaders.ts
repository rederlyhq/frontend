import { Column } from 'material-table';

const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

export const GRADES_SIMPLIFIED_HEADERS : Column<object>[]  = [
    { title: 'First Name', field: 'firstName', customSort: (x: any, y: any)  => collator.compare(x.firstName, y.firstName)},
    { title: 'Last Name', field: 'lastName', customSort: (x: any, y: any)  => collator.compare(x.lastName, y.lastName)},
    { title: 'Opened', field: 'openAverage', customSort: (x: any, y: any) => collator.compare(x.openAverage, y.openAverage) },
    { title: 'Closed', field: 'deadAverage', customSort: (x: any, y: any) => collator.compare(x.deadAverage, y.deadAverage) },
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
    { title: 'Average Opened', field: 'averageScoreOpen', render: (data: any) => data.averageScoreOpen?.toPercentString() ?? '--'},
    { title: 'Average Closed', field: 'averageScoreDead', render: (data: any) => data.averageScoreDead?.toPercentString() ?? '--'},
    { title: 'Average Total', field: 'averageScore' },
];

export const STUDENT_STATISTICS_SIMPLIFIED_HEADERS : Column<object>[]  = [
    { title: 'Name', field: 'name', customSort: (x: any, y: any)  => collator.compare(x.name, y.name)},
    { title: 'Attempts', field: 'averageAttemptedCount' },
    { title: 'Opened', field: 'averageScoreOpen', render: (data: any) => data.averageScoreOpen?.toPercentString() ?? '--'},
    { title: 'Closed', field: 'averageScoreDead', render: (data: any) => data.averageScoreDead?.toPercentString() ?? '--'},
    { title: 'Total', field: 'averageScore' },
];
