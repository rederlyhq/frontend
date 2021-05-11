import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import HomePage from './Home/HomePage';
import VerificationLandingPage from './Login/VerificationLandingPage';
import NavWrapper from './NavWrapper/NavWrapper';
import ForgotPasswordLandingPage from './Login/ForgotPasswordLandingPage';
import { AuthorizationWrapper } from './NavWrapper/AuthorizationWrapper';
import useTracking from './Hooks/useTracking';
import { QueryParamProvider } from 'use-query-params';

interface RouterProps {

}

const TrackingWrapper = ({children}: {children: React.ReactNode}) => {
    useTracking();

    return <>{children}</>;
};


export const Router: React.FC<RouterProps> = () => {
    return (
        <BrowserRouter>
            <QueryParamProvider ReactRouterRoute={Route}>
                <TrackingWrapper>
                    <Switch>
                        <Route exact path="/">
                            <HomePage/>
                        </Route>
                        <Route path="/common">
                            <AuthorizationWrapper>
                                <NavWrapper>
                                    {/* All authenticated routing happens in this component. */}
                                </NavWrapper>
                            </AuthorizationWrapper>
                        </Route>
                        <Route path="/verify/:uid">
                            <VerificationLandingPage />
                        </Route>
                        <Route path="/forgot-password/:uid">
                            <ForgotPasswordLandingPage />
                        </Route>
                        <Route path="/">
                            <NoPage/>
                        </Route>
                    </Switch>
                </TrackingWrapper>
            </QueryParamProvider>
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