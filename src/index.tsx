import './wdyr'; // <--- Must be first import (when enabled)
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Router } from './Router';
import './Extensions';
import GlobalErrorBoundaryState from './Utilities/ErrorBoundaries/GlobalErrorBoundary';
import { VersionCheck } from './Utilities/VersionCheck';

if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_ENABLE_AXE === 'true') {
    const axe = require('react-axe');
    axe(React, ReactDOM, 1000);
}

ReactDOM.render(
    <React.StrictMode>
        <GlobalErrorBoundaryState>
            <VersionCheck>
                <Router />
            </VersionCheck>
        </GlobalErrorBoundaryState>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
