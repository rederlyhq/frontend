/* eslint-disable react/display-name */
import React, { useState, forwardRef, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import MaterialTable from 'material-table';
// import { MdSearch, MdFirstPage, MdLastPage, MdClear, MdFilterList, MdChevronRight, MdChevronLeft, MdArrowDownward, MdFileDownload} from 'react-icons/md';
import { Clear, SaveAlt, FilterList, FirstPage, LastPage, ChevronRight, ChevronLeft, Search, ArrowDownward } from '@material-ui/icons';
import { ProblemObject, CourseObject } from '../CourseInterfaces';
import ProblemIframe from '../../Assignments/ProblemIframe';
import _ from 'lodash';
import AxiosRequest from '../../Hooks/AxiosRequest';
import * as qs from 'querystring';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import moment from 'moment';

interface StatisticsTabProps {
    course: CourseObject;
    userId?: number;
}

enum StatisticsView {
    UNITS = 'UNITS',
    TOPICS = 'TOPICS',
    PROBLEMS = 'PROBLEMS',
    ATTEMPTS = 'ATTEMPTS',
}

const gradeCols = [
    {title: 'Name', field: 'name'},
    {title: 'Average number of attempts', field: 'averageAttemptedCount'},
    {title: 'Average grade', field: 'averageScore'},
    {title: '% Completed', field: 'completionPercent'},
];

const attemptCols = [
    {title: 'Result', field: 'result'},
    {title: 'Attempt Time', field: 'time'},
];


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


/**
 * When a professor wishes to see a student's view, they pass in the student's userId.
 * When they wish to see overall course statistics, they do not pass any userId.
 */
export const StatisticsTab: React.FC<StatisticsTabProps> = ({course, userId}) => {
    const [view, setView] = useState<string>(StatisticsView.UNITS);
    const [idFilter, setIdFilter] = useState<number | null>(null);
    const [rowData, setRowData] = useState<Array<any>>([]);
    const userType: UserRole = getUserRole();

    useEffect(() => {
        console.log('Rerunning useEffect');
        if (!course || course.id === 0) return;
    
        let url = '/courses/statistics';
        let filterParam: string = '';
        let idFilterLocal = idFilter;
        switch (view) {
        case StatisticsView.TOPICS:
            url = `${url}/topics?`;
            filterParam = 'courseUnitContentId';
            break;
        case StatisticsView.PROBLEMS:
            url = `${url}/questions?`;
            filterParam = 'courseTopicContentId';
            break;
        case StatisticsView.ATTEMPTS:
            url = `/users/${userId}?includeGrades=WITH_ATTEMPTS&`;
            // TODO: This should be removed when a similar call as the others is supported.
            idFilterLocal = null;
            break;
        default:
            url = `${url}/units?`;
            filterParam = '';
            if(idFilterLocal !== null) {
                console.error('This should be null for units');
                idFilterLocal = null;
            }
            break;
        }

        const queryString = qs.stringify(_({
            courseId: course.id,
            [filterParam]: idFilterLocal,
            userId: userType === UserRole.STUDENT && view !== StatisticsView.ATTEMPTS ? userId : null,
        }).omitBy(_.isNil).value() as any).toString();

        url = `${url}${queryString}`;

        (async () => {
            try {
                const res = await AxiosRequest.get(url);
                let data = res.data.data;

                const formatNumberString = (val: string, percentage: boolean = false) => {
                    if(_.isNil(val)) return null;
                    if (percentage) return `${(parseFloat(val) * 100).toFixed(1)}%`;
                    
                    return parseFloat(val).toFixed(2);
                };
                
                if (view === StatisticsView.ATTEMPTS) {
                    let grades = data.grades.filter((grade: any) => {
                        const hasAttempts = grade.numAttempts > 0;
                        const satisfiesIdFilter = idFilter ? grade.courseWWTopicQuestionId === idFilter : true;
                        return hasAttempts && satisfiesIdFilter;
                    });

                    data = grades.map((grade: any) => (
                        grade.workbooks.map((attempt: any) => ({
                            id: attempt.courseWWTopicQuestionId,
                            submitted: attempt.submitted,
                            result: attempt.result,
                            time: moment(attempt.time).fromNow(),
                        }))
                    ));
                    data = _.flatten(data);
                } else {
                    data = data.map((d: any) => ({
                        ...d,
                        averageAttemptedCount: formatNumberString(d.averageAttemptedCount),
                        averageScore: formatNumberString(d.averageScore, true),
                        completionPercent: formatNumberString(d.completionPercent, true)
                    }));
                }
                setRowData(data);
            } catch (e) {
                console.error('Failed to get statistics.', e);
                return;
            }
        })();
    }, [course.id, view, idFilter, userId]);

    const renderProblemPreview = (rowData: any) => {
        if (userId !== undefined) {
            return <iframe 
                title='Problem Preview Frame'
                style={{width: '100%', height: '30vh', border: 'none', minHeight: '350px'}}
                sandbox='allow-same-origin allow-scripts allow-popups'
                srcDoc={rowData.submitted.renderedHTML}
            />;
        }
        else {
            return <ProblemIframe problem={new ProblemObject({id: rowData.id})} setProblemStudentGrade={() => {}} />;
        }
    };

    const nextView = (event: any, rowData: any, togglePanel: any) => {
        switch (view) {
        case StatisticsView.UNITS:
            setIdFilter(rowData.id);
            setView(StatisticsView.TOPICS);
            break;
        case StatisticsView.TOPICS:
            setIdFilter(rowData.id);
            setView(StatisticsView.PROBLEMS);
            break;
        case StatisticsView.PROBLEMS:
            console.log(userId);
            if (userId !== undefined) {
                setIdFilter(rowData.id);
                console.log('Switching to Attempts');
                setView(StatisticsView.ATTEMPTS);
            } else {
                console.log('Showing a panel.');
                togglePanel();
            }
            break;
        case StatisticsView.ATTEMPTS:
            togglePanel();
            break;
        default:
            break;
        }   
    };
    
    const hasDetailPanel = userId !== undefined ? 
        view === StatisticsView.ATTEMPTS :
        view === StatisticsView.PROBLEMS;
    
    let seeMoreActions: Array<any> | undefined = hasDetailPanel ? undefined : [{
        icon: () => <ChevronRight/>,
        tooltip: 'See More',
        onClick: _.curryRight(nextView)(()=>{}),
    }];

    return (
        <>
            <Nav fill variant='pills' activeKey={view} onSelect={(selectedKey: string) => {
                setView(selectedKey);
                setIdFilter(null);
            }}>
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
                {userId !== undefined && <Nav.Item>
                    <Nav.Link eventKey={StatisticsView.ATTEMPTS}>
                        Attempts
                    </Nav.Link>
                </Nav.Item>}
            </Nav>
            <div style={{maxWidth: '100%'}}>
                <MaterialTable
                    icons={icons}
                    title={course.name}
                    columns={view === StatisticsView.ATTEMPTS ? attemptCols : gradeCols}
                    data={rowData}
                    actions={seeMoreActions}
                    onRowClick={nextView}
                    options={{
                        exportButton: true
                    }}
                    detailPanel={hasDetailPanel ? [{
                        icon: () => <ChevronRight/>,
                        render: renderProblemPreview
                    }] : undefined}
                    localization={{header: { actions: '' }}}
                />
            </div>
        </>
    );
};

export default StatisticsTab;