import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import CoursePage from '../Courses/CoursePage';

interface NavWrapperProps {

}

/**
 * The NavWrapper is intended to allow for providing toolbars and menus for navigation.
 * Once authenticated, all routes should pass-through this layer to ensure nav elements are displayed.
 */
export const NavWrapper: React.FC<NavWrapperProps> = () => {
    const { path, url } = useRouteMatch();

    // TODO: Check if the user has been deauthenticated (ex: expired) and display a message.

    return (
        <Switch>
            <Route path={`${path}/courses`}>
                <CoursePage/>
            </Route>
        </Switch>
    );
};
export default NavWrapper;