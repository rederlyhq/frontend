/* eslint-disable react/display-name */
import React, { useState, forwardRef, useEffect } from 'react';
import { Col, Nav } from 'react-bootstrap';
import MaterialTable, { Column } from 'material-table';
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
    { title: 'Name', field: 'name' },
    { title: 'Average number of attempts', field: 'averageAttemptedCount' },
    { title: 'Average grade', field: 'averageScore' },
    { title: '% Completed', field: 'completionPercent' },
];

const attemptCols: Array<Column<any>> = [
    { title: 'Result', field: 'result', defaultSort: 'asc' },
    {
        title: 'Attempt Time',
        field: 'time',
        // These options don't seem to work.
        // defaultSort: 'desc',
        // defaultGroupSort: 'desc',
        // defaultGroupOrder: 1,
        sorting: true,
        type: 'datetime',
        render: (datetime: any) => <span title={moment(datetime.time).toString()}>{moment(datetime.time).fromNow()}</span>,
        customSort: (a: any, b: any) => moment(b.time).diff(moment(a.time))
    },
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


interface BreadCrumbFilter {
    id: number;
    displayName: string;
}

type EnumDictionary<T extends string | symbol | number, U> = {
    [K in T]?: U;
};

type BreadCrumbFilters = EnumDictionary<StatisticsView, BreadCrumbFilter>;

/**
 * When a professor wishes to see a student's view, they pass in the student's userId.
 * When they wish to see overall course statistics, they do not pass any userId.
 */
export const StatisticsTab: React.FC<StatisticsTabProps> = ({ course, userId }) => {
    const [view, setView] = useState<StatisticsView>(StatisticsView.UNITS);
    const [idFilter, setIdFilter] = useState<number | null>(null);
    const [breadcrumbFilter, setBreadcrumbFilters] = useState<BreadCrumbFilters>({});
    const [rowData, setRowData] = useState<Array<any>>([]);
    const userType: UserRole = getUserRole();

    useEffect(() => {
        console.log('Rerunning useEffect');
        if (course?.id === 0) return;

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
            if (idFilterLocal !== null) {
                console.error('This should be null for units');
                idFilterLocal = null;
            }
            break;
        }

        const queryString = qs.stringify(_({
            courseId: course.id,
            [filterParam]: idFilterLocal,
            userId: view !== StatisticsView.ATTEMPTS ? userId : null,
        }).omitBy(_.isNil).value() as any).toString();

        url = `${url}${queryString}`;

        (async () => {
            try {
                const res = await AxiosRequest.get(url);
                let data = res.data.data;

                const formatNumberString = (val: string, percentage: boolean = false) => {
                    if (_.isNil(val)) return null;
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
                            id: attempt.id,
                            submitted: attempt.submitted,
                            result: `${(attempt.result * 100).toFixed(1)}%`,
                            time: attempt.time,
                            problemId: grade.courseWWTopicQuestionId
                        }))
                    ));
                    data = _.flatten(data);
                    data = data.sort((a: any, b: any) => moment(b.time).diff(moment(a.time)));
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
    }, [course.id, view, idFilter, userId, userType]);

    const renderProblemPreview = (rowData: any) => {
        return <ProblemIframe problem={new ProblemObject({ id: rowData.problemId })} setProblemStudentGrade={() => { }} workbookId={rowData.id} readonly={true} />;
    };

    const resetBreadCrumbs = (selectedKey: string, newBreadcrumb?: BreadCrumbFilter) => {
        let key: StatisticsView = StatisticsView.UNITS;
        let lastFilter: number | null = null;
        const newBreadcrumbFilter: EnumDictionary<StatisticsView, BreadCrumbFilter> = {};
        // used to break the loop after one extra iteration (or 0 if it reaches the end)
        let breakLoop = false;
        for((key as string) in StatisticsView) {
            // now that key is the correct value (1 after the selected) break the loop
            if (breakLoop) {
                break;
            }
            newBreadcrumbFilter[key] = breadcrumbFilter[key];
            lastFilter = newBreadcrumbFilter[key]?.id || null;
            // I want key to increment once more, so using a boolean to break at the start of the next iteration
            if (key === selectedKey) {
                breakLoop = true;
                if (!_.isNil(newBreadcrumb)) {
                    newBreadcrumbFilter[key] = newBreadcrumb;
                }
            }
        }
        setBreadcrumbFilters(newBreadcrumbFilter);
        return {
            lastFilter,
            nextKey: key
        };
    };

    const nextView = (event: any, rowData: any, togglePanel: any) => {
        const newBreadcrumb = {
            id: rowData.id,
            displayName: rowData.name
        };
        switch (view) {
        case StatisticsView.UNITS:
            setIdFilter(rowData.id);
            resetBreadCrumbs(view, newBreadcrumb);
            setView(StatisticsView.TOPICS);
            break;
        case StatisticsView.TOPICS:
            setIdFilter(rowData.id);
            resetBreadCrumbs(view, newBreadcrumb);
            setView(StatisticsView.PROBLEMS);
            break;
        case StatisticsView.PROBLEMS:
            console.log(userId);
            if (userId !== undefined) {
                setIdFilter(rowData.id);
                console.log('Switching to Attempts');
                resetBreadCrumbs(view, newBreadcrumb);
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

    const getTitle = (): string => {
        let result = course.name;
        Object.keys(StatisticsView).forEach((key: string) => {
            result = breadcrumbFilter[key as StatisticsView]?.displayName ?? result;
        });
        return result;
    };

    const hasDetailPanel = userId !== undefined ?
        view === StatisticsView.ATTEMPTS :
        view === StatisticsView.PROBLEMS;

    let seeMoreActions: Array<any> | undefined = hasDetailPanel ? undefined : [{
        icon: () => <ChevronRight />,
        tooltip: 'See More',
        onClick: _.curryRight(nextView)(() => { }),
    }];
    return (
        <>
            <Nav fill variant='pills' activeKey={view} onSelect={(selectedKey: string) => {
                setView(selectedKey as StatisticsView);
                setBreadcrumbFilters({});
                setIdFilter(null);
            }}>
                {Object.keys(StatisticsView).map((key: string) => (
                    (key !== StatisticsView.ATTEMPTS || userId !== undefined) &&
                    <Col key={`global-${key}`}>
                        <Nav.Item>
                            <Nav.Link eventKey={key} >
                                {_.capitalize(key)}
                            </Nav.Link>
                        </Nav.Item>
                    </Col>
                ))}
            </Nav>
            <Nav fill variant='pills' activeKey={view} onSelect={(selectedKey: string) => {
                const { nextKey, lastFilter } = resetBreadCrumbs(selectedKey);
                setView(nextKey);
                setIdFilter(lastFilter);
            }}>
                {Object.keys(StatisticsView).map((key: string) => (
                    (key !== StatisticsView.ATTEMPTS || userId !== undefined) &&
                    <Col key={`filtered-${key}`}>
                        <Nav.Item>
                            <Nav.Link eventKey={key} className={`${_.isNil(breadcrumbFilter[key as StatisticsView]) ? 'invisible' : ''}`} >
                                {breadcrumbFilter[key as StatisticsView]?.displayName}
                            </Nav.Link>
                        </Nav.Item>
                    </Col>
                ))}
            </Nav>
            <div style={{ maxWidth: '100%' }}>
                <MaterialTable
                    icons={icons}
                    title={getTitle()}
                    columns={view === StatisticsView.ATTEMPTS ? attemptCols : gradeCols}
                    data={rowData}
                    actions={seeMoreActions}
                    onRowClick={nextView}
                    options={{
                        exportButton: true,
                        sorting: true
                    }}
                    detailPanel={hasDetailPanel ? [{
                        icon: () => <ChevronRight />,
                        render: renderProblemPreview
                    }] : undefined}
                    localization={{ header: { actions: '' } }}
                />
            </div>
        </>
    );
};

export default StatisticsTab;