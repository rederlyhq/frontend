/* eslint-disable react/display-name */
import React, { useState, forwardRef } from 'react';
import { Nav } from 'react-bootstrap';
import MaterialTable from 'material-table';
// import { MdSearch, MdFirstPage, MdLastPage, MdClear, MdFilterList, MdChevronRight, MdChevronLeft, MdArrowDownward, MdFileDownload} from 'react-icons/md';
import { Clear, SaveAlt, FilterList, FirstPage, LastPage, ChevronRight, ChevronLeft, Search, ArrowDownward } from "@material-ui/icons";
import * as data from '../../Mocks/mockStatistics.json';

interface StatisticsTabProps {

}

enum StatisticsView {
    UNITS = 'UNITS',
    TOPICS = 'TOPICS',
    PROBLEMS = 'PROBLEMS',
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
}

export const StatisticsTab: React.FC<StatisticsTabProps> = () => {
    const [view, setView] = useState<string>(StatisticsView.UNITS);
    let rowData: any = data.units;

    switch (view) {
    case StatisticsView.TOPICS:
        rowData = data.topics;
        break;
    case StatisticsView.PROBLEMS:
        rowData = data.questions;
        break;
    default:
        break;
    }

    const nextView = () => {
        switch (view) {
        case StatisticsView.UNITS:
            setView(StatisticsView.TOPICS);
            break;
        case StatisticsView.TOPICS:
            setView(StatisticsView.PROBLEMS);
            break;
        case StatisticsView.PROBLEMS:
            // TODO: Navigate to a renderer view?
            break;
        default:
            break;
        }   
    }

    return (
        <>
            <Nav fill variant='pills' activeKey={view} onSelect={(selectedKey: string) => setView(selectedKey)}>
                <Nav.Item>
                    <Nav.Link eventKey={StatisticsView.UNITS}>
                        Units
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={StatisticsView.TOPICS}>
                        Topics
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={StatisticsView.PROBLEMS}>
                        Problems
                    </Nav.Link>
                </Nav.Item>
            </Nav>
            <div style={{maxWidth: '100%'}}>
                <MaterialTable
                    icons={icons}
                    title='Statistics'
                    columns={[
                        {title: 'Name', field: 'Name'},
                        {title: 'Average number of attempts', field: 'Average number of attempts'},
                        {title: 'Average grade', field: 'Average grade'},
                        {title: '% Completed', field: '% Completed'},
                    ]}
                    data={rowData}
                    actions={[{
                        icon: () => <ChevronRight/>,
                        tooltip: 'See More',
                        onClick: nextView,
                    }]}
                    onRowClick={nextView}
                    options={{
                        exportButton: true
                    }}
                />
            </div>
        </>
    );
};

export default StatisticsTab;