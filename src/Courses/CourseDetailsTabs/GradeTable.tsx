/* eslint-disable react/display-name */
import React, {forwardRef} from 'react';
import { Table } from 'react-bootstrap';
import _ from 'lodash';
import MaterialTable from 'material-table';
import { Clear, SaveAlt, FilterList, FirstPage, LastPage, ChevronRight, ChevronLeft, Search, ArrowDownward } from "@material-ui/icons";

interface GradeTableProps {
    courseName: string;
    grades: Array<any>;
    onRowClick?: (id: number) => void;
}
const icons = {
    // Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    // Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    // Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    // DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    // Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Clear: forwardRef<any>((props, ref) => <Clear {...props} ref={ref} />),
    Export: forwardRef<any>((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef<any>((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef<any>((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef<any>((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef<any>((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef<any>((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef<any>((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef<any>((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef<any>((props, ref) => <ArrowDownward {...props} ref={ref} />),
    // ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    // ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

export const GradeTable: React.FC<GradeTableProps> = ({courseName, grades, onRowClick}) => {
    if (grades.length <= 0) return null;

    // Material UI edits the object in-place, which causes problems.
    const safeGrades = grades.map(obj => ({...obj}));
    const headers = _.keys(safeGrades[0]);
    console.log(headers);
    console.log(safeGrades);

    return (
        <div style={{maxWidth: '100%'}}>
            <MaterialTable
                icons={icons}
                title={courseName}
                columns={headers.map(col => ({title: _.startCase(_.replace(col, 'ProblemCount', '')), field: col}))}
                data={safeGrades || []}
                // Actions might take a professor to a Student's profile.
                // actions={seeMoreActions}
                onRowClick={()=>{}}
                options={{
                    exportButton: true
                }}
                // detailPanel={view === StatisticsView.PROBLEMS ? [{
                //     icon: () => <ChevronRight/>,
                //     render: renderProblemPreview
                // }] : undefined}
                // localization={{header: { actions: '' }}}
            />
        </div>
    );
};

export default GradeTable;