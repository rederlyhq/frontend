import React from 'react';
import { Switch, Route, useRouteMatch, Redirect, useHistory } from 'react-router-dom';
import CoursePage from '../Courses/CoursePage';
import Cookies from 'js-cookie';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AxiosRequest from '../Hooks/AxiosRequest';
import CourseDetailsPage from '../Courses/CourseDetailsPage';
import { BsChevronLeft } from 'react-icons/bs';

import './NavWrapper.css';
import { UserRole } from '../Enums/UserRole';

interface NavWrapperProps {

}

export const userContext = React.createContext({userType: 'Professor'});

/**
 * The NavWrapper is intended to allow for providing toolbars and menus for navigation.
 * Once authenticated, all routes should pass-through this layer to ensure nav elements are displayed.
 */
export const NavWrapper: React.FC<NavWrapperProps> = () => {
    const { path } = useRouteMatch();
    const history = useHistory();
    const sessionCookie = Cookies.get('sessionToken');
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
        <Container>
            {/* Header bar */}
            <Row className="toolbar">
                <Col md={2}>
                    {history.length > 1 && (
                        <Button className="toolbar" onClick={() => history.goBack()}>
                            <BsChevronLeft/>
                        </Button>)
                    }
                </Col>
                <Col className="text-center" md={8}>
                    <span id="welcome-header">Welcome, {'ToDo: Get Name'}</span>
                </Col>
                <Col md={2}>
                    <Button className="toolbar float-right" onClick={logout}>
                        Log Out
                    </Button>
                </Col>
            </Row>
            <Provider value={{userType: UserRole.PROFESSOR}}>
                <Switch>
                    <Route exact path={`${path}/courses`}>
                        <CoursePage/>
                    </Route>
                    <Route path={`${path}/courses/:courseid`}>
                        <CourseDetailsPage/>
                    </Route>
                </Switch>
            </Provider>
        </Container>
    );
};
export default NavWrapper;