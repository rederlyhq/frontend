import React from 'react';
import _ from 'lodash';
import MaterialTable from 'material-table';
import MaterialIcons from '../../Components/MaterialIcons';
import { MenuItem, Select, TablePagination } from '@material-ui/core';
import { GRADES_SIMPLIFIED_HEADERS, GRADES_SIMPLIFIED_PROBLEM_HEADERS, GRADES_SIMPLIFIED_TOPICS_HEADERS } from './TableColumnHeaders';
import { TOPIC_TYPE_FILTERS } from '../CourseInterfaces';

interface GradeTableProps {
    courseName: string;
    grades: Array<any>;
    onRowClick?: (event: any, rowData: any) => void;
    topicTypeFilter: TOPIC_TYPE_FILTERS;
    setTopicTypeFilter: React.Dispatch<React.SetStateAction<TOPIC_TYPE_FILTERS>>;
}

export const GradeTable: React.FC<GradeTableProps> = ({courseName, grades, onRowClick, setTopicTypeFilter, topicTypeFilter}) => {
    // Material UI edits the object in-place, which causes problems.
    let safeGrades = grades.map(obj => ({
        ...obj,
        ...(_.isUndefined(obj.average) ? undefined : {average: _.isNull(obj.average) ? '--' : obj.average.toPercentString()}),
        ...(_.isUndefined(obj.openAverage) ? undefined : {openAverage: _.isNull(obj.openAverage) ? '--' : obj.openAverage.toPercentString()}),
        ...(_.isUndefined(obj.deadAverage) ? undefined : {deadAverage: _.isNull(obj.deadAverage) ? '--' : obj.deadAverage.toPercentString()}),
        ...(_.isUndefined(obj.effectiveScore) ? undefined : {effectiveScore: _.isNull(obj.effectiveScore) ? '--' : obj.effectiveScore.toPercentString()}),
        ...(_.isUndefined(obj.systemScore) ? undefined : {systemScore: _.isNull(obj.systemScore) ? '--' : obj.systemScore.toPercentString()}),
    }));

    const getHeaders = (grades: Array<any>) => {
        if (_.has(grades.first, 'openAverage')) {
            return GRADES_SIMPLIFIED_HEADERS;
        } else if (_.has(grades.first, 'numAttempts')) {
            return GRADES_SIMPLIFIED_PROBLEM_HEADERS;
        } else {
            return GRADES_SIMPLIFIED_TOPICS_HEADERS;
        }
    };

    return (
        <div style={{maxWidth: '100%'}}>
            <MaterialTable
                key={safeGrades.length}
                icons={MaterialIcons}
                title={courseName}
                columns={getHeaders(safeGrades)}
                data={safeGrades || []}
                onRowClick={onRowClick}
                options={{
                    exportButton: true,
                    exportAllData: true,
                    pageSize: safeGrades.length,
                    emptyRowsWhenPaging: false,
                }}
                actions={[
                    {
                        icon: function FilterComponent() { 
                            return <Select
                                value={topicTypeFilter}
                                onChange={(e) => setTopicTypeFilter(e.target.value as TOPIC_TYPE_FILTERS)}
                            >
                                <MenuItem value={TOPIC_TYPE_FILTERS.ALL}>ALL</MenuItem>
                                <MenuItem value={TOPIC_TYPE_FILTERS.EXAMS}>EXAMS</MenuItem>
                                <MenuItem value={TOPIC_TYPE_FILTERS.HOMEWORK}>HOMEWORK</MenuItem>
                            </Select>;
                        },
                        isFreeAction: true,
                        onClick: _.noop
                    }
                ]}
                components={{
                    Pagination: function PaginationWrapper(props) {
                        return <TablePagination
                            {...props}
                            rowsPerPageOptions={[..._.range(0, safeGrades.length, 5), { label: 'All', value: safeGrades.length }]}
                        />;
                    }
                }}
            />
        </div>
    );
};

export default GradeTable;