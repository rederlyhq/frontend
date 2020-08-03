import React from 'react';
import { Switch, Route, useRouteMatch, Redirect, useHistory, Link } from 'react-router-dom';
import CoursePage from '../Courses/CoursePage';
import Cookies from 'js-cookie';
import { Container, Navbar, NavbarBrand, Nav, NavDropdown } from 'react-bootstrap';
import AxiosRequest from '../Hooks/AxiosRequest';
import CourseDetailsPage from '../Courses/CourseDetailsPage';
import { AnimatePresence } from 'framer-motion';
import './NavWrapper.css';
import NavbarCollapse from 'react-bootstrap/NavbarCollapse';
import { getUserRole } from '../Enums/UserRole';
import CourseCreationPage from '../Courses/CourseCreation/CourseCreationPage';
import CourseEditPage from '../Courses/CourseCreation/CourseEditPage';
import SimpleProblemPage from '../Assignments/SimpleProblemPage';
import AdviserPage from '../Adviser/AdviserPage';
import EnrollUserPage from '../Courses/EnrollUserPage';
import { ProvideFeedback } from './ProvideFeedback';

interface NavWrapperProps {

}

export const userContext = React.createContext({ userType: 'Professor' });

/**
 * The NavWrapper is intended to allow for providing toolbars and menus for navigation.
 * Once authenticated, all routes should pass-through this layer to ensure nav elements are displayed.
 */
export const NavWrapper: React.FC<NavWrapperProps> = () => {
    const { path } = useRouteMatch();
    const history = useHistory();
    const sessionCookie = Cookies.get('sessionToken');
    const userName = Cookies.get('userName');
    const { Provider } = userContext;

    // TODO: Check if the user has been deauthenticated (ex: expired) and display a message.
    if (!sessionCookie) {
        return <Redirect to={{
            pathname: '/'
        }} />;
    }

    const logout = async () => {
        let res = await AxiosRequest.post('/users/logout');
        if (res.status !== 200) {
            console.warn('Unnecessary call to logout.');
        }
        history.push('/');
    };

    return (
        <Container fluid id='navbarParent'>
            {/* Header bar */}
            <Navbar variant='dark' bg='dark' className="toolbar mr-auto">
                <NavbarBrand as={Link} to="/common/courses">
                    <img
                        src="/logo-rederly+RGB-original.png"
                        className='d-inline-block align-top'
                        alt='Rederly logo'
                        height={50}
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
                            <NavDropdown.Item onClick={logout}>Log out</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </NavbarCollapse>
            </Navbar>
            {/* Routing for the page content */}
            <Container fluid>
                <Provider value={{ userType: getUserRole(sessionCookie) }}>
                    <AnimatePresence exitBeforeEnter initial={false}>
                        <Switch>
                            <Route exact path={`${path}/adviser`}>
                                <AdviserPage />
                            </Route>
                            <Route exact path={`${path}/courses`}>
                                <CoursePage />
                            </Route>
                            <Route exact path={`${path}/courses/new`}>
                                <CourseCreationPage />
                            </Route>
                            <Route path={`${path}/courses/edit/:courseId`}>
                                <CourseEditPage />
                            </Route>
                            <Route path={`${path}/courses/enroll/:enrollCode`}>
                                <EnrollUserPage />
                            </Route>
                            <Route path={`${path}/courses/:courseId/:topicId`}>
                                <SimpleProblemPage />
                            </Route>
                            <Route path={`${path}/courses/:courseId`}>
                                <CourseDetailsPage />
                            </Route>
                            <Route path="/">
                                {/* <NoPage/> */}
                                <h1>Page not found.</h1>
                            </Route>
                        </Switch>
                    </AnimatePresence>
                </Provider>
            </Container>
        </Container>
    );
};
export default NavWrapper;