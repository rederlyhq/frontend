/* eslint-disable react/display-name */
import React, { useState, forwardRef, useEffect } from 'react';
import { Alert, Button, Col, Nav } from 'react-bootstrap';
import MaterialTable, { Column } from 'material-table';
// import { MdSearch, MdFirstPage, MdLastPage, MdClear, MdFilterList, MdChevronRight, MdChevronLeft, MdArrowDownward, MdFileDownload} from 'react-icons/md';
import { Clear, SaveAlt, FilterList, FirstPage, LastPage, ChevronRight, ChevronLeft, Search, ArrowDownward } from '@material-ui/icons';
import { ProblemObject, CourseObject, StudentGrade } from '../CourseInterfaces';
import ProblemIframe from '../../Assignments/ProblemIframe';
import _ from 'lodash';
import AxiosRequest from '../../Hooks/AxiosRequest';
import * as qs from 'querystring';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import moment from 'moment';
import { BsLock, BsPencilSquare, BsUnlock } from 'react-icons/bs';
import { OverrideGradeModal } from './OverrideGradeModal';
import { ConfirmationModal } from '../../Components/ConfirmationModal';
import { IAlertModalState } from '../../Hooks/useAlertState';
import { putQuestionGrade } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';

const FILTERED_STRING = '_FILTERED';

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

enum StatisticsViewFilter {
    UNITS_FILTERED = 'UNITS_FILTERED',
    TOPICS_FILTERED = 'TOPICS_FILTERED',
    PROBLEMS_FILTERED = 'PROBLEMS_FILTERED',
    ATTEMPTS_FILTERED = 'ATTEMPTS_FILTERED',
}

type StatisticsViewAll = StatisticsView | StatisticsViewFilter;

const statisticsViewFromAllStatisticsViewFilter = (view: StatisticsViewAll): StatisticsView => {
    if (view.endsWith('_FILTERED')) {
        return view.slice(0, view.length - FILTERED_STRING.length) as StatisticsView;
    }
    return view as StatisticsView;
};

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

enum GradesStateView {
    LOCK='LOCK',
    OVERRIDE='OVERRIDE',
    NONE='NONE'
}

interface GradesState {
    view: GradesStateView;
    lockAlert: IAlertModalState | null;
    rowData?: any
}

const defaultGradesState: GradesState = {
    view: GradesStateView.NONE,
    lockAlert: null,
    rowData: undefined
};

/**
 * When a professor wishes to see a student's view, they pass in the student's userId.
 * When they wish to see overall course statistics, they do not pass any userId.
 */
export const StatisticsTab: React.FC<StatisticsTabProps> = ({ course, userId }) => {
    const [view, setView] = useState<StatisticsViewAll>(StatisticsView.UNITS);
    const [idFilter, setIdFilter] = useState<number | null>(null);
    const [breadcrumbFilter, setBreadcrumbFilters] = useState<BreadCrumbFilters>({});
    const [rowData, setRowData] = useState<Array<any>>([]);
    const [gradesState, setGradesState] = useState<GradesState>(defaultGradesState);
    const [grade, setGrade] = useState<StudentGrade | null>(null);
    const userType: UserRole = getUserRole();

    const globalView = statisticsViewFromAllStatisticsViewFilter(view);

    useEffect(() => {
        console.log('Rerunning useEffect');
        if (course?.id === 0) return;

        let url = '/courses/statistics';
        let filterParam: string = '';
        let idFilterLocal = idFilter;

        switch (view) {
        case StatisticsView.UNITS:
            url = `${url}/units?`;
            filterParam = '';
            if (idFilterLocal !== null) {
                console.error('This should be null for units');
                idFilterLocal = null;
            }
            break;
        case StatisticsViewFilter.UNITS_FILTERED:
        case StatisticsView.TOPICS:
            url = `${url}/topics?`;
            filterParam = 'courseUnitContentId';
            break;
        case StatisticsViewFilter.TOPICS_FILTERED:
        case StatisticsView.PROBLEMS:
            url = `${url}/questions?`;
            filterParam = 'courseTopicContentId';
            break;
        case StatisticsViewFilter.PROBLEMS_FILTERED:
        case StatisticsView.ATTEMPTS:
            url = `/users/${userId}?includeGrades=WITH_ATTEMPTS&`;
            // TODO: This should be removed when a similar call as the others is supported.
            idFilterLocal = null;
            break;
        default:
            console.error('You should not havea  view that is not the views or filtered views');
            break;
        }

        const queryString = qs.stringify(_({
            courseId: course.id,
            [filterParam]: idFilterLocal,
            userId: (view !== StatisticsView.ATTEMPTS && view !== StatisticsViewFilter.PROBLEMS_FILTERED) ? userId : null,
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

                if (view === StatisticsView.ATTEMPTS || view === StatisticsViewFilter.PROBLEMS_FILTERED) {
                    let grades = data.grades.filter((grade: any) => {
                        const hasAttempts = grade.numAttempts > 0;
                        const satisfiesIdFilter = idFilter ? grade.courseWWTopicQuestionId === idFilter : true;
                        return hasAttempts && satisfiesIdFilter;
                    });

                    setGrade(grades[0]);
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
                    setGradesState(defaultGradesState);
                    setGrade(null);
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
    }, [course.id, globalView, idFilter, userId, userType]);

    const renderProblemPreview = (rowData: any) => {
        return <ProblemIframe problem={new ProblemObject({ id: rowData.problemId })} setProblemStudentGrade={() => { }} workbookId={rowData.id} readonly={true} />;
    };

    const resetBreadCrumbs = (selectedKey: string, newBreadcrumb?: BreadCrumbFilter) => {
        let globalSelectedKey: StatisticsView = statisticsViewFromAllStatisticsViewFilter(selectedKey as StatisticsViewAll);
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
            if (key === globalSelectedKey) {
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
            resetBreadCrumbs(StatisticsView.UNITS, newBreadcrumb);
            setView(StatisticsViewFilter.UNITS_FILTERED);
            break;
        case StatisticsViewFilter.UNITS_FILTERED:
        case StatisticsView.TOPICS:
            setIdFilter(rowData.id);
            resetBreadCrumbs(StatisticsView.TOPICS, newBreadcrumb);
            setView(StatisticsViewFilter.TOPICS_FILTERED);
            break;
        case StatisticsViewFilter.TOPICS_FILTERED:
        case StatisticsView.PROBLEMS:
            console.log(userId);
            if (userId !== undefined) {
                setIdFilter(rowData.id);
                console.log('Switching to Attempts');
                resetBreadCrumbs(StatisticsView.PROBLEMS, newBreadcrumb);
                setView(StatisticsViewFilter.PROBLEMS_FILTERED);
            } else {
                console.log('Showing a panel.');
                togglePanel();
            }
            break;
        case StatisticsView.ATTEMPTS:
        case StatisticsViewFilter.PROBLEMS_FILTERED:
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
        (view === StatisticsView.ATTEMPTS || view === StatisticsViewFilter.PROBLEMS_FILTERED):
        (view === StatisticsView.PROBLEMS || view === StatisticsViewFilter.TOPICS_FILTERED);
    
    let actions: Array<any> | undefined = [];
    if(!hasDetailPanel) {
        actions.push({
            icon: () => <ChevronRight />,
            tooltip: 'See More',
            onClick: _.curryRight(nextView)(() => { }),
        });
    }
    if (!_.isNil(userId) && view === StatisticsViewFilter.TOPICS_FILTERED) {
        // This doesn't need to be in a function, however if it's not it renders one button before the other
        actions.push((rowData: any) => {
            if(_.isNil(rowData.grades)) {
                return;
            }
            return {
                icon: () => <BsPencilSquare />,
                tooltip: 'Override grade',
                onClick: (_event: any, rowData: any) => {
                    setGrade(rowData.grades[0]);
                    setGradesState({
                        ...gradesState,
                        view: GradesStateView.OVERRIDE,
                        rowData
                    });
                }
            };
        });

        actions.push((rowData: any) => {
            if(_.isNil(rowData.grades)) {
                return;
            }
            return {
                icon: () => rowData.grades[0].locked ? <BsLock/> : <BsUnlock/>,
                tooltip: `Grade ${rowData.grades[0].locked ? 'Locked' : 'Unlocked'}`,
                onClick: () => {
                    setGrade(rowData.grades[0]);
                    setGradesState({
                        ...gradesState,
                        view: GradesStateView.LOCK,
                        rowData
                    });
                }
            };
        });
    }

    if(_.isEmpty(actions)) {
        actions = undefined;
    }    

    return (
        <>
            <Nav fill variant='pills' activeKey={view} onSelect={(selectedKey: string) => {
                setView(selectedKey as StatisticsViewAll);
                setBreadcrumbFilters({});
                setIdFilter(null);
            }}>
                {Object.keys(StatisticsView).map((key: string) => (
                    (key !== StatisticsView.ATTEMPTS || userId !== undefined) &&
                    <Col key={`global-${key}`} className="p-0" >
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
                setView(selectedKey as StatisticsViewFilter);
                setIdFilter(lastFilter);
            }}>
                {Object.keys(StatisticsViewFilter).map((key: string) => {
                    const globalKey = statisticsViewFromAllStatisticsViewFilter(key as StatisticsViewFilter);
                    return (
                        (key !== StatisticsViewFilter.ATTEMPTS_FILTERED || userId !== undefined) &&
                        <Col key={`filtered-${key}`} className="p-0" >
                            <Nav.Item>
                                <Nav.Link eventKey={key} className={`${_.isNil(breadcrumbFilter[globalKey as StatisticsView]) ? 'invisible' : ''}`} >
                                    {breadcrumbFilter[globalKey]?.displayName}
                                </Nav.Link>
                            </Nav.Item>
                        </Col>
                    );
                })}
            </Nav>
            <div style={{ maxWidth: '100%' }}>
                {userType === UserRole.PROFESSOR && !_.isNil(userId) && !_.isNil(grade) && 
                <>
                    <OverrideGradeModal
                        show={gradesState.view === GradesStateView.OVERRIDE}
                        onHide={() => setGradesState(defaultGradesState)}
                        grade={grade}
                        onSuccess={(newGrade: Partial<StudentGrade>) => {
                            if(!_.isNil(gradesState.rowData?.grades[0]) && !_.isNil(newGrade.effectiveScore)) {
                                gradesState.rowData.averageScore = `${(newGrade.effectiveScore * 100).toFixed(1)}%`;
                                gradesState.rowData.grades[0] = newGrade;
                            }

                            setGrade(newGrade as StudentGrade);
                        }}
                    />

                    <ConfirmationModal
                        show={gradesState.view === GradesStateView.LOCK}
                        onHide={() => setGradesState(defaultGradesState)}
                        onConfirm={async () => {
                            try {
                                if (_.isNil(grade) || _.isNil(grade.id)) {
                                    throw new Error('Application Error: Grade null');
                                }
                                setGradesState(defaultGradesState);
                                const newLockedValue = !grade.locked;
                                const result = await putQuestionGrade({
                                    id: grade.id,
                                    data: {
                                        locked: newLockedValue
                                    }
                                });

                                if(!_.isNil(gradesState.rowData?.grades[0])) {
                                    gradesState.rowData.grades[0].locked = newLockedValue;
                                }

                                setGradesState(defaultGradesState);
                                setGrade(result.data.data.updatesResult.updatedRecords[0] as StudentGrade);
                            } catch (e) {
                                setGradesState({
                                    ...gradesState,
                                    lockAlert: {
                                        message: e.message,
                                        variant: 'danger'
                                    }
                                });
                            }
                        }}
                        confirmText="Confirm"
                        headerContent={<h6>{grade.locked ? 'Unlock' : 'Lock'} Grade</h6>}
                        bodyContent={(<>
                            {gradesState.lockAlert && <Alert variant={gradesState.lockAlert.variant}>{gradesState.lockAlert.message}</Alert>}
                            <p>Are you sure you want to {grade.locked ? 'unlock' : 'lock'} this grade?</p>
                            {grade.locked && <p>Doing this might allow the student to get an updated score on this problem.</p>}
                            {!grade.locked && <p>The student will no longer be able to get updates to their score for this problem.</p>}
                        </>)}
                    />
                </>}
                <MaterialTable
                    icons={icons}
                    title={(
                        <div className="d-flex">
                            <h6
                                style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                                className="MuiTypography-root MuiTypography-h6"
                            >
                                {getTitle()}
                            </h6>
                            {userType === UserRole.PROFESSOR && !_.isNil(userId) && !_.isNil(grade) && (view === StatisticsViewFilter.PROBLEMS_FILTERED) && 
                            <>
                                <Button
                                    className="ml-3 mr-1"
                                    onClick={() => setGradesState({
                                        ...gradesState,
                                        view: GradesStateView.OVERRIDE
                                    })}
                                >
                                    <>
                                        <BsPencilSquare/> Override
                                    </>
                                </Button>

                                <Button
                                    variant={grade.locked ? 'warning' : 'danger'}
                                    className="ml-1 mr-1"
                                    onClick={() => setGradesState({
                                        ...gradesState,
                                        view: GradesStateView.LOCK
                                    })}
                                >
                                    {grade.locked ? <><BsLock/> Unlock</>: <><BsUnlock/> Lock</>}
                                </Button>
                            </>
                            }
                        </div>
                    )}
                    columns={(view === StatisticsView.ATTEMPTS || view === StatisticsViewFilter.PROBLEMS_FILTERED) ? attemptCols : gradeCols}
                    data={rowData}
                    actions={actions}
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