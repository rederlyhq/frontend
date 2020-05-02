import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import HomePage from './Home/HomePage';
import VerificationLandingPage from './Login/VerificationLandingPage';
import NavWrapper from './NavWrapper/NavWrapper';
import Cookies from 'js-cookie';

interface RouterProps {

}

export const Router: React.FC<RouterProps> = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route exact path="/">
                    <HomePage/>
                </Route>
                <Route path="/common">
                    <NavWrapper>
                        {/* All authenticated routing happens in this component. */}
                    </NavWrapper>
                </Route>
                <Route path="/verify/:uid">
                    <VerificationLandingPage />
                </Route>
                <Route path="/">
                    <NoPage/>
                </Route>
            </Switch>
        </BrowserRouter>
    );
};

function NoPage() {
    return (
        <>
            <h1>404 Error</h1>
            <h2>Page not found</h2>
        </>
    );
}