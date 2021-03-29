import React, { useRef, useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';
import { Link as MaterialLink, Menu, MenuItem } from '@material-ui/core';
import _ from 'lodash';
import useBreadcrumbs from 'use-react-router-breadcrumbs';
import { NamedBreadcrumbs, useBreadcrumbLookupContext } from '../Contexts/BreadcrumbContext';
import { MdArrowDropDown } from 'react-icons/md';
import { getUserRole, UserRole } from '../Enums/UserRole';

interface URLBreadcrumbProps {

}

export const URLBreadcrumb: React.FC<URLBreadcrumbProps> = () => {
    const topicNavDropdownPaths = [
        // {
        //     path: '/common/courses/:courseId/topic/:topicId',
        //     breadcrumb: ViewTopicBreadcrumbDropdown,
        // },
        {
            path: '/common/courses/:courseId/topic/:topicId/settings',
            breadcrumb: SettingsTopicBreadcrumbDropdown,
        },
        {
            path: '/common/courses/:courseId/topic/:topicId/grading',
            breadcrumb: GradingTopicBreadcrumbDropdown,
        },
    ];

    const breadcrumbs = useBreadcrumbs([
        ...topicNavDropdownPaths,
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
            path: '/common/courses/:id/settings',
            breadcrumb: 'Extensions',
        },
        {
            path: '/common/courses/:courseId/topic/:topicId',
            breadcrumb: ViewTopicBreadcrumbDropdown,
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
            {breadcrumbs.map(
                ({ breadcrumb, match, key, location }, index) => {
                    
                    const isInDropdown = _.find(topicNavDropdownPaths, ['path', (match as any).path]);
                    if (isInDropdown !== undefined) {
                        return (
                            <React.Fragment key={`Link${match.url}`}>
                                <span style={{padding: '0em 1em 0em 1em' }}>/</span>
                                {breadcrumb}
                            </React.Fragment>
                        );
                    }
                    
                    // Render these breadcrumbs as is (without Links around them). This is useful for raw components or intentionally unlinked leaf pages.
                    if (((match as any).path === '/common/courses/:courseId/topic/:topicId' && index === breadcrumbs.length - 1)
                        || (match as any).path === '/common/problem-browser/search') {
                        return (
                            <React.Fragment key={`Link${match.url}`}>
                                <span style={{padding: '0em 1em 0em 1em' }}>/</span>
                                {breadcrumb}
                            </React.Fragment>
                        );
                    }

                    return <React.Fragment key={`Link${match.url}`}>
                        <span style={{padding: '0em 1em 0em 1em' }}>/</span>
                        <MaterialLink component={Link} to={match.url}>
                            {breadcrumb}
                        </MaterialLink>
                    </React.Fragment>;
                }
            )}
        </Breadcrumb>
    );
};

export default URLBreadcrumb;

export const NamedBreadcrumbComponent: React.FC<{breadcrumb: NamedBreadcrumbs}> = ({breadcrumb}) => {
    const {breadcrumbLookup} = useBreadcrumbLookupContext();

    if (_.isEmpty(breadcrumbLookup)) return null;

    return <span>{breadcrumbLookup[breadcrumb]}</span>;
};


export const NamedCourseBreadcrumbComponent: React.FC<void> = () => <NamedBreadcrumbComponent breadcrumb={NamedBreadcrumbs.COURSE} />;
export const NamedTopicBreadcrumbComponent: React.FC<{}> = () => <NamedBreadcrumbComponent breadcrumb={NamedBreadcrumbs.TOPIC} />;

const TopicDropdownOptions = {
    Assignment: (courseId: string, topicId: string) => `/common/courses/${courseId}/topic/${topicId}`,
    Settings: (courseId: string, topicId: string) => `/common/courses/${courseId}/topic/${topicId}/settings`,
    Grading: (courseId: string, topicId: string) => `/common/courses/${courseId}/topic/${topicId}/grading`,
    // Extensions: (courseId: string, topicId: string) => `/common/courses/${courseId}/settings`,
};

export const TopicBreadcrumbDropdowns: React.FC<{selectedBreadcrumb: keyof typeof TopicDropdownOptions, courseId: string, topicId: string}> = ({selectedBreadcrumb, courseId, topicId}) => {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<keyof typeof TopicDropdownOptions>(selectedBreadcrumb);
    const ref = useRef<HTMLSpanElement>(null);
    const history = useHistory();

    const handleClose = () => setMenuOpen(false);

    return <>
        <span 
            ref={ref}
            className={'MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary'}
            style={{cursor: 'pointer'}}
            onClick={()=>setMenuOpen(true)}
            onKeyPress={(e) => (e.key === 'Enter') && setMenuOpen(true) }
            role='menu'
            tabIndex={0}
        >
            {selected === 'Assignment' ? 
                <NamedTopicBreadcrumbComponent /> :
                selected
            }
            <MdArrowDropDown />
        </span>
        <Menu
            id="simple-menu"
            anchorEl={ref.current}
            keepMounted
            open={menuOpen}
            onClose={handleClose}
        >
            {
                _.keys(TopicDropdownOptions).map((key) => {
                    if (getUserRole() === UserRole.STUDENT && key === 'Settings') return null; 

                    return (
                        <MenuItem 
                            key={key} 
                            onClick={() => {
                                setSelected(key as keyof typeof TopicDropdownOptions); 
                                setMenuOpen(false);
                                const to = TopicDropdownOptions[key as keyof typeof TopicDropdownOptions](courseId, topicId);
                                history.push(to);
                            }}
                            role='menuoption'
                            selected={selected === key}
                        >
                            {key}
                        </MenuItem>
                    );
                })
            }
        </Menu>
    </>;
};

const ViewTopicBreadcrumbDropdown: React.FC<{match: any; location: any}> = ({match, location}) => {
    return match.url !== location.pathname ?
        <NamedTopicBreadcrumbComponent /> :
        <TopicBreadcrumbDropdowns selectedBreadcrumb={'Assignment'} courseId={match.params.courseId} topicId={match.params.topicId} />;
};
const SettingsTopicBreadcrumbDropdown: React.FC<{match: any}> = ({match}) => <TopicBreadcrumbDropdowns selectedBreadcrumb={'Settings'} courseId={match.params.courseId} topicId={match.params.topicId} />;
const GradingTopicBreadcrumbDropdown: React.FC<{match: any}> = ({match}) => <TopicBreadcrumbDropdowns selectedBreadcrumb={'Grading'} courseId={match.params.courseId} topicId={match.params.topicId} />;