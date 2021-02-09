import React, { useEffect, useState } from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { useQuery } from '../Hooks/UseQuery';
import { ProblemBrowserOpenProblemLibraryForm } from './ProblemBrowserOpenProblemLibraryForm';
import { ProblemBrowserCourseForm } from './ProblemBrowserCourseForm';
import { ProblemBrowserPrivateForm } from './ProblemBrowserPrivateForm';

interface ProblemBrowserSearchPageProps {

}

enum ProblemBrowserSearchPageTabs {
    OPEN_PROBLEM_LIBRARY = 'Open Problem Library',
    COURSES = 'Courses',
    PRIVATE_CONTENT = 'Private Content'
}

export const ProblemBrowserSearchPage: React.FC<ProblemBrowserSearchPageProps> = () => {
    const queryParams = useQuery();
    const history = useHistory();
    const { url } = useRouteMatch();
    const [activeTab, setActiveTab] = useState<ProblemBrowserSearchPageTabs>(ProblemBrowserSearchPageTabs.OPEN_PROBLEM_LIBRARY);
    const tab = queryParams.get('tab') as ProblemBrowserSearchPageTabs | null;

    // TODO: Back navigation with this approach seems slow. Is there a faster way to detect the url change?
    useEffect(()=>{
        setActiveTab(tab ?? ProblemBrowserSearchPageTabs.OPEN_PROBLEM_LIBRARY);
    }, [tab]);
    

    return (
        <Container>
            <Tabs
                activeKey={activeTab}
                defaultActiveKey={''}
                onSelect={(activeTab: any) => {
                    setActiveTab(activeTab);
                    history.push(`${url}?tab=${activeTab}`);
                }}
            >
                <Tab
                    mountOnEnter
                    eventKey={ProblemBrowserSearchPageTabs.OPEN_PROBLEM_LIBRARY} title={ProblemBrowserSearchPageTabs.OPEN_PROBLEM_LIBRARY}
                    style={{marginBottom:'10px'}}
                >
                    <ProblemBrowserOpenProblemLibraryForm />
                </Tab>
                <Tab
                    mountOnEnter
                    eventKey={ProblemBrowserSearchPageTabs.COURSES} title={ProblemBrowserSearchPageTabs.COURSES}
                    style={{marginBottom:'10px'}}
                >
                    <ProblemBrowserCourseForm />
                </Tab>
                <Tab
                    mountOnEnter
                    eventKey={ProblemBrowserSearchPageTabs.PRIVATE_CONTENT} title={ProblemBrowserSearchPageTabs.PRIVATE_CONTENT}
                    style={{marginBottom:'10px'}}
                >
                    <ProblemBrowserPrivateForm />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default ProblemBrowserSearchPage;