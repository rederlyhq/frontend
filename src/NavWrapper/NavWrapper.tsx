import React from 'react';
import { Switch, Route, useRouteMatch, Redirect, useHistory } from 'react-router-dom';
import CoursePage from '../Courses/CoursePage';
import Cookies from 'js-cookie';
import { Container, Row, Col, Button } from 'react-bootstrap';
import AxiosRequest from '../Hooks/AxiosRequest';

interface NavWrapperProps {

}


/**
 * The NavWrapper is intended to allow for providing toolbars and menus for navigation.
 * Once authenticated, all routes should pass-through this layer to ensure nav elements are displayed.
 */
export const NavWrapper: React.FC<NavWrapperProps> = () => {
    const { path } = useRouteMatch();
    const history = useHistory();
    const sessionCookie = Cookies.get('sessionToken');

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
            <Row>
                <Col>
                    <Button style={{'float': 'right'}} onClick={logout}>
                        Log Out
                    </Button>
                </Col>
            </Row>
            <Switch>
                <Route path={`${path}/courses`}>
                    <CoursePage/>
                </Route>
            </Switch>
        </Container>
    );
};
export default NavWrapper;