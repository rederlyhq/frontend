import React from 'react';
import { Table } from 'react-bootstrap';
import _ from 'lodash';

interface GradeTableProps {
    grades: Array<any>;
    onRowClick?: (id: number) => void;
}

export const GradeTable: React.FC<GradeTableProps> = ({grades, onRowClick}) => {
    if (grades.length <= 0) return null;
    return (
        <Table striped bordered hover>
            <thead>
                {_.map(_.keys(grades[0]), key => (
                    <th>{_.startCase(key)}</th>
                ))}
            </thead>
            <tbody>
                { _.map(grades, gradeRow => (
                    <tr key={gradeRow.id} onClick={() => onRowClick && onRowClick(gradeRow.id)}>
                        {_.map(_.values(gradeRow), val => (
                            <td>{val}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default GradeTable;