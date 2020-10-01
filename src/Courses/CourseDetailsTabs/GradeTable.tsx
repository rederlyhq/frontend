/* eslint-disable react/display-name */
import React from 'react';
import _ from 'lodash';
import MaterialTable from 'material-table';
import MaterialIcons from '../../Components/MaterialIcons';

interface GradeTableProps {
    courseName: string;
    grades: Array<any>;
    onRowClick?: (event: any, rowData: any) => void;
}

export const GradeTable: React.FC<GradeTableProps> = ({courseName, grades, onRowClick}) => {
    if (grades.length <= 0) return null;

    // Material UI edits the object in-place, which causes problems.
    let safeGrades = grades.map(obj => ({
        ...obj,
    }));
    const headers = _(safeGrades[0]).keys().filter(n => n !== 'id').value();
    if(headers.indexOf('average') >= 0) {
        // Would include this in above mapping, however using ternary operated resulted in an empty column in questions
        safeGrades = safeGrades.map(obj => ({
            ...obj,
            average: _.isNil(obj.average) ? '--' : `${(obj.average * 100).toFixed(1)}%`
        }));
    }

    return (
        <div style={{maxWidth: '100%'}}>
            <MaterialTable
                icons={MaterialIcons}
                title={courseName}
                columns={headers.map(col => ({title: _.startCase(_.replace(col, 'ProblemCount', '')), field: col}))}
                data={safeGrades || []}
                onRowClick={onRowClick}
                options={{
                    exportButton: true
                }}
            />
        </div>
    );
};

export default GradeTable;