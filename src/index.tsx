import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Router } from './Router';
import './Extensions';
import GlobalErrorBoundaryState from './Utilities/ErrorBoundaries/GlobalErrorBoundary';
import { VersionCheck } from './Utilities/VersionCheck';
import reportWebVitals from './Utilities/reportWebVitals';

// if (process.env.NODE_ENV !== 'production') {
//     var axe = require('react-axe');
//     axe(React, ReactDOM, 1000);
// }

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


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
