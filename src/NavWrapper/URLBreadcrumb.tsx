import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import {default as MaterialLink} from '@material-ui/core/Link';
import _ from 'lodash';
import useBreadcrumbs from 'use-react-router-breadcrumbs';
import { NamedBreadcrumbs, useBreadcrumbLookupContext } from '../Contexts/BreadcrumbContext';

interface URLBreadcrumbProps {

}

export const URLBreadcrumb: React.FC<URLBreadcrumbProps> = () => {
    const breadcrumbs = useBreadcrumbs([
        {
            path: '/common/problem-browser',
            breadcrumb: 'Problem Browser',
        },
        {
            path: '/common/courses/new',
            breadcrumb: 'New Course',
        },
        {
            path: '/common/courses/edit',
            breadcrumb: 'Customize Curriculum',
        },
        {
            path: '/common/courses/:courseId/settings',
            breadcrumb: 'Extensions',
        },
        {
            path: '/common/courses/:id/topic/:topicId',
            breadcrumb: NamedTopicBreadcrumbComponent,
        },
        {
            path: '/common/courses/:id',
            breadcrumb: NamedCourseBreadcrumbComponent,
        },
    ], {
        excludePaths: [
            '/common/courses/:id/topic',
            '/common/courses',
            '/common',
            '/',
        ]
    });

    return (
        <Breadcrumb aria-label='breadcrumb'>
            <MaterialLink key='Link/common/courses' component={Link} to='/common/courses'>
                My Courses
            </MaterialLink>
            {breadcrumbs.map(({ breadcrumb, match }) => (
                <React.Fragment key={`Link${breadcrumb}`}>
                    <span style={{padding: '0em 1em 0em 1em' }}>/</span>
                    <MaterialLink component={Link} to={match.url}>
                        {breadcrumb}
                    </MaterialLink>
                </React.Fragment >
            ))}
        </Breadcrumb>
    );
};

export default URLBreadcrumb;

export const NamedBreadcrumbComponent: React.FC<{breadcrumb: NamedBreadcrumbs}> = ({breadcrumb}) => {
    const {breadcrumbLookup} = useBreadcrumbLookupContext();

    if (breadcrumbLookup === undefined || _.isEmpty(breadcrumbLookup)) return null;

    return <span>{breadcrumbLookup[breadcrumb]}</span>;
};


export const NamedCourseBreadcrumbComponent: React.FC<void> = () => <NamedBreadcrumbComponent breadcrumb={NamedBreadcrumbs.COURSE} />;
export const NamedTopicBreadcrumbComponent: React.FC<void> = () => <NamedBreadcrumbComponent breadcrumb={NamedBreadcrumbs.TOPIC} />;
