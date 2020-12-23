import { Column } from 'material-table';

const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});

export const GRADES_SIMPLIFIED_HEADERS = [
    { title: 'First Name', field: 'firstName', customSort: (x: any, y: any)  => collator.compare(x.firstName, y.firstName)},
    { title: 'Last Name', field: 'lastName', customSort: (x: any, y: any)  => collator.compare(x.lastName, y.lastName)},
    { title: 'Open', field: 'openAverage', customSort: (x: any, y: any) => collator.compare(x.openAverage, y.openAverage) },
    { title: 'Closed', field: 'deadAverage', customSort: (x: any, y: any) => collator.compare(x.deadAverage, y.deadAverage) },
    { title: 'Total', field: 'average', customSort: (x: any, y: any) => collator.compare(x.average, y.average) },
];

export const GRADES_SIMPLIFIED_TOPICS_HEADERS = [
    { title: 'First Name', field: 'firstName', customSort: (x: any, y: any)  => collator.compare(x.firstName, y.firstName)},
    { title: 'Last Name', field: 'lastName', customSort: (x: any, y: any)  => collator.compare(x.lastName, y.lastName)},
    { title: 'Effective Grade', field: 'average', customSort: (x: any, y: any) => collator.compare(x.average, y.average) },
    { title: 'System Grade', field: 'systemScore', customSort: (x: any, y: any) => collator.compare(x.systemScore, y.systemScore) },
];

export const GRADES_SIMPLIFIED_PROBLEM_HEADERS = [
    { title: 'First Name', field: 'firstName', customSort: (x: any, y: any)  => collator.compare(x.firstName, y.firstName)},
    { title: 'Attempts', field: 'numAttempts'},
    { title: 'Last Name', field: 'lastName', customSort: (x: any, y: any)  => collator.compare(x.lastName, y.lastName)},
    { title: 'Effective Grade', field: 'effectiveScore', customSort: (x: any, y: any) => collator.compare(x.effectiveScore, y.effectiveScore) },
    { title: 'System Grade', field: 'systemScore', customSort: (x: any, y: any) => collator.compare(x.systemScore, y.systemScore) },
];

export const STATISTICS_SIMPLIFIED_HEADERS = [
    { title: 'Name', field: 'name', customSort: (x: any, y: any)  => collator.compare(x.name, y.name)},
    { title: 'Number of Attempts', field: 'averageAttemptedCount' },
    { title: 'Grade', field: 'averageScore' },
    { title: 'Mastered', field: 'completionPercent' },
    { title: 'System Score', field: 'systemScore' },
    // { title: 'Open Score'), field: 'openAverage' },
    // { title: 'Dead Score'), field: 'deadAverage' },
];

export const STUDENTS_STATISTICS_SIMPLIFIED_HEADERS : Column<object>[] = [
    { title: 'Name', field: 'name', customSort: (x: any, y: any)  => collator.compare(x.name, y.name)},
    { title: 'Number of Attempts', field: 'averageAttemptedCount' },
    { title: 'Grade', field: 'averageScore' },
    { title: 'Mastered', field: 'completionPercent' },
    { title: 'System Score', field: 'systemScore' },
    // { title: 'Open Score'), field: 'openAverage' },
    // { title: 'Dead Score'), field: 'deadAverage' },
];