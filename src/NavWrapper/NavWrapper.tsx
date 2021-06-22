import React, { useEffect, useState } from 'react';
import { Switch, Route, useRouteMatch, Redirect, useHistory, Link } from 'react-router-dom';
import { History } from 'history';
import CoursePage from '../Courses/CoursePage';
import Cookies from 'js-cookie';
import { Container, Navbar, NavbarBrand, Nav, NavDropdown, Row, Col } from 'react-bootstrap';
import CourseDetailsPage from '../Courses/CourseDetailsPage';
import { AnimatePresence } from 'framer-motion';
import './NavWrapper.css';
import NavbarCollapse from 'react-bootstrap/NavbarCollapse';
import { getUserRole, unauthorizedRedirect, UserRole } from '../Enums/UserRole';
import CourseCreationPage from '../Courses/CourseCreation/CourseCreationPage';
import SimpleProblemPage from '../Assignments/SimpleProblemPage';
import EnrollUserPage from '../Courses/EnrollUserPage';
import { ProvideFeedback } from './ProvideFeedback';
import AccountWrapper from '../Account/AccountWrapper';
import { CookieEnum } from '../Enums/CookieEnum';
import URLBreadcrumb from './URLBreadcrumb';
import ExtensionsPage from '../Courses/Extensions/ExtensionsPage';
import CourseProvider from '../Courses/CourseProvider';
import TopicSettingsPage from '../Courses/TopicSettings/TopicSettingsPage';
import logger from '../Utilities/Logger';
import TopicGradingPage from '../Courses/TopicGrades/GradingPage';
import { ProblemEditor } from '../Assignments/ProblemEditor';
import { ProblemBrowserSearchPage } from '../ProblemBrowser/ProblemBrowserSearchPage';
import { ProblemBrowserResults } from '../ProblemBrowser/ProblemBrowserResults';
import PrintEverything from '../Courses/TopicGrades/PrintEverything';
import { PrintLoadingProvider } from '../Contexts/PrintLoadingContext';
import localPreferences from '../Utilities/LocalPreferences';
import { impersonate, logout } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import { BreadcrumbLookupProvider } from '../Contexts/BreadcrumbContext';
import PrintBlankTopic from '../Courses/TopicGrades/PrintBlankTopic';
import { VersionCheck } from '../Utilities/VersionCheck';
import QuickSuperDashboard from '../SuperAdmin/QuickSuperDashboard';

const { session } = localPreferences;


interface NavWrapperProps {

}

export const userContext = React.createContext({ userType: 'Professor' });

// TODO find a place to put this
// Once cookies are reactive we won't need to use the history object anymore thus this method will have no react dependencies
// Until then leaving here
export const performLogout = async (history: History) => {
    try {
        await logout();
    } catch (e) {
        logger.error('Error logging out', e);
    }

    Cookies.remove(CookieEnum.SESSION);
    session.nullifySession();

    history.push('/');
};

/**
 * The NavWrapper is intended to allow for providing toolbars and menus for navigation.
 * Once authenticated, all routes should pass-through this layer to ensure nav elements are displayed.
 */
export const NavWrapper: React.FC<NavWrapperProps> = () => {
    const { path } = useRouteMatch();
    const history = useHistory();
    const sessionCookie = Cookies.get(CookieEnum.SESSION);
    const userName = localPreferences.session.username;
    const { Provider } = userContext;
    const [ softReloadFlag, setSoftReloadFlag ] = useState<boolean>(false);

    useEffect(() => {
        setSoftReloadFlag(false);
    }, [softReloadFlag]);

    // TODO: Check if the user has been deauthenticated (ex: expired) and display a message.
    if (!sessionCookie) {
        logger.info('Logging out due to missing session token.');
        unauthorizedRedirect(false);
        return <Redirect to={{
            pathname: '/'
        }} />;
    }

    const logoutClicked = async () => {
        performLogout(history);
    };

    if (softReloadFlag) {
        return <></>;
    }

    return (
        <Container fluid id='navbarParent'>
            <BreadcrumbLookupProvider>
                {/* Header bar */}
                <Navbar role='navigation' variant='dark' bg='dark' className="toolbar mr-auto">
                    <NavbarBrand as={Link} to="/common/courses">
                        <img
                            src={
                                // Fair warning, don't === this, it's not a real boolean.
                                window.Modernizr.webp ?
                                    '/rederly-logo-offwhite.webp' :
                                    '/rederly-logo-offwhite.png'
                            }
                            className='d-inline-block align-top'
                            alt='Rederly logo'
                            height={50}
                            width={155}
                        />
                    </NavbarBrand>
                    <NavbarCollapse>
                        <Nav className="text-center mr-auto">
                            {/* <Link to='/common/courses'>Courses</Link> */}
                        </Nav>
                        <Nav className="float-right">
                            <ProvideFeedback />
                        </Nav>
                        <Nav className="float-right">
                            <NavDropdown title={`Welcome, ${userName}`} id='account-dropdown'>
                                <NavDropdown.Item onClick={()=>{history.push(`${path}/account`);}}>My Account</NavDropdown.Item>
                                {getUserRole() !== UserRole.STUDENT &&
                                    <>
                                        <NavDropdown.Item onClick={()=>{history.push(`${path}/editor`);}}>Problem Editor</NavDropdown.Item>
                                        <NavDropdown.Item onClick={()=>{history.push(`${path}/problem-browser`);}}>Problem Browser</NavDropdown.Item>
                                    </>
                                }
                                {(session.userType !== UserRole.STUDENT || ((session.actualUserType !== null) && session.actualUserType !== UserRole.STUDENT)) &&
                                    <NavDropdown.Item onClick={()=> {
                                        (async () => {
                                            if (session.actualUserType === null) {
                                                session.actualUserType = session.userType;
                                            }
                                            try {
                                                const roleToSend = session.userType === UserRole.STUDENT ?
                                                    null :
                                                    UserRole.STUDENT;
                                                
                                                await impersonate({
                                                    role: roleToSend
                                                });
                                                
                                                session.userType = session.userType === UserRole.STUDENT ?
                                                    UserRole.PROFESSOR :
                                                    UserRole.STUDENT;
                                            } catch (e) {
                                                logger.error('Could not get impersonation cookie', e);
                                                // TODO show on UI
                                            }
                                            
                                            // Doing this updates the ui appropriately, however it doesn't refetch all the data
                                            // history.replace(window.location.pathname + window.location.search);
                                            // window.location.reload();
                                            setSoftReloadFlag(true);
                                        })();
                                    }}>
                                        {session.userType === UserRole.STUDENT ? 'Professor' : 'Student'} View
                                    </NavDropdown.Item>
                                }
                                <NavDropdown.Item onClick={logoutClicked}>Log out</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </NavbarCollapse>
                </Navbar>
                {/* Routing for the page content */}
                <Container fluid role='main'>
                    <Provider value={{userType: getUserRole()}}>
                        <AnimatePresence initial={false}>
                            <URLBreadcrumb key='URLBreadcrumb' />
                            <Switch>
                                {getUserRole() === UserRole.SUPERADMIN && [{
                                    path: `${path}/superadmin`,
                                    child: <QuickSuperDashboard />
                                }].map(obj =>
                                    <Route exact path={obj.path} key={obj.path}>
                                        {obj.child}
                                    </Route>)
                                }
                                {getUserRole() !== UserRole.STUDENT && [{
                                    path: `${path}/editor`,
                                    child: <ProblemEditor />
                                }, {
                                    path: `${path}/problem-browser`,
                                    child: <ProblemBrowserSearchPage />
                                }, {
                                    path: `${path}/problem-browser/search`,
                                    child: <ProblemBrowserResults />
                                }, {
                                    path: `${path}/courses/new`,
                                    child: <CourseCreationPage />
                                }].map(obj =>
                                    <Route exact path={obj.path} key={obj.path}>
                                        {obj.child}
                                    </Route>)
                                }
                                <Route exact path={`${path}/account`}>
                                    <AccountWrapper />
                                </Route>
                                <Route exact path={`${path}/courses`}>
                                    <CoursePage />
                                </Route>
                                <Route path={`${path}/courses/enroll/:enrollCode`}>
                                    <EnrollUserPage />
                                </Route>
                                <Route path={`${path}/courses/:courseId`}>
                                    <CourseProvider>
                                        <Switch>
                                            {getUserRole() !== UserRole.STUDENT && [{
                                                path: `${path}/courses/:courseId/topic/:topicId/settings`,
                                                child: <TopicSettingsPage />
                                            }, {
                                                path: `${path}/courses/:courseId/topic/:topicId/grading/print/:userId`,
                                                child: <PrintLoadingProvider><PrintEverything /></PrintLoadingProvider>
                                            }, {
                                                path: `${path}/courses/:courseId/topic/:topicId/grading/print/`,
                                                child: <PrintLoadingProvider><PrintBlankTopic /></PrintLoadingProvider>
                                            }, {
                                                path: `${path}/courses/:courseId/settings`,
                                                child: <ExtensionsPage />
                                            }].map(obj =>
                                                <Route exact path={obj.path} key={obj.path}>
                                                    {obj.child}
                                                </Route>)
                                            }
                                            <Route exacat path={`${path}/courses/:courseId/topic/:topicId/grading`}>
                                                <TopicGradingPage />
                                            </Route>
                                            <Route exact path={`${path}/courses/:courseId/topic/:topicId`}>
                                                <SimpleProblemPage />
                                            </Route>
                                            <Route exact path={`${path}/courses/:courseId`}>
                                                <CourseDetailsPage />
                                            </Route>
                                            <Route>
                                                {/* <NoPage/> */}
                                                <h1>Page not found.</h1>
                                                {/* <Redirect to={{
                                                    pathname: '/'
                                                }} /> */}
                                            </Route>
                                        </Switch>
                                    </CourseProvider>
                                </Route>
                                <Route path='/'>
                                    {/* <NoPage/> */}
                                    <h1>Page not found.</h1>
                                </Route>
                            </Switch>
                        </AnimatePresence>
                    </Provider>
                    <Navbar fixed="bottom" variant='dark' bg='dark' className='footer'>
                        <Row style={{
                            // There is some weird spacing here, if you do 100% it ignores the parents padding and starts all the way to left
                            // The parent has 16px padding, each column has 15
                            // So width 100% has 16px padding leading but trailing it has 31px
                            width: '100vw'
                        }}>
                            <Col><VersionCheck /></Col>
                            <Col style={{float: 'right', textAlign: 'right'}}>User Role: {localPreferences.session.userType}</Col>
                        </Row>
                    </Navbar>
                </Container>
            </BreadcrumbLookupProvider>
        </Container>
    );
};
export default NavWrapper;