/**
 * THE APPROACH CHANGED AND THIS COMPONENT IS NOT CURRENTLY USED
 * leaving in case we want to use it in the future
 */
import React, { useEffect, useState } from 'react';
import { getTopicGradesForCourse } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { CourseObject } from '../CourseInterfaces';
import _ from 'lodash';
import { TopicGradeForCourse } from '../../APIInterfaces/BackendAPI/ResponseTypes/CourseResponseTypes';
import { TablePagination } from '@material-ui/core';
import MaterialTable from 'material-table';
import MaterialIcons from '../../Components/MaterialIcons';
import logger from '../../Utilities/Logger';

enum MainColumns {
    NAME='name',
    TOTAL_PROBLEM_WEIGHT='totalProblemWeight',
    REQUIRED_PROBLEM_WEIGHT='requiredProblemWeight'
}

// Efficient numeric-safe sorting https://stackoverflow.com/a/38641281/4752397
const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
const sortFunction = (x: any, y: any)  => collator.compare(x.name, y.name);

interface TopicGradesTabProps {
    course?: CourseObject;
}
export const TopicGradesTab: React.FC<TopicGradesTabProps> = ({
    course
}) => {
    const [topicGrades, setTopicGrades] = useState<Array<TopicGradeForCourse> | null>(null);
    const safeTopicGrades = _.isNil(topicGrades) ? [] : _.cloneDeep(topicGrades);
    const courseId = course?.id;
    useEffect(() => {
        (async () => {
            if (_.isNil(courseId)) {
                return;
            }
            try {
                const result = await getTopicGradesForCourse({
                    courseId: courseId
                });
                setTopicGrades(result.data.data.topics);
            } catch(e) {
                logger.error(e);
            }
        })();
    }, [courseId]);

    return (<div style={{maxWidth: '100%'}}>
        <MaterialTable
            key={safeTopicGrades.length ?? 0}
            icons={MaterialIcons}
            title={course?.name ?? ''}
            columns={Object.keys(safeTopicGrades.first ?? {}).map(key => {
                const isMainColumn = Object.values<string>(MainColumns).includes(key);
                const isNameColumn = key === MainColumns.NAME;
                const title = isMainColumn ? _.startCase(key) : key;
                return {
                    title: title,
                    field: key,
                    sorting: true,
                    searchable: isNameColumn,
                    customSort: isNameColumn ? sortFunction : undefined
                };
            })}
            data={safeTopicGrades}
            // onRowClick={onRowClick}
            options={{
                exportButton: true,
                exportAllData: true,
                pageSize: safeTopicGrades.length ?? 0,
                emptyRowsWhenPaging: false,
            }}
            // actions={[{
            //     icon: function IconWrapper() { return <AssignmentReturnedOutlinedIcon />; },
            //     tooltip: 'Download topic grades',
            //     onClick: (_event: any, user: any) => undefined,
            //     position: 'toolbar'
            // }]}
            components={{
                Pagination: function PaginationWrapper(props) {
                    return <TablePagination
                        {...props}
                        rowsPerPageOptions={[..._.range(0, safeTopicGrades.length, 5), { label: 'All', value: safeTopicGrades.length }]}
                    />;
                }
            }}
        />
    </div>);
};
