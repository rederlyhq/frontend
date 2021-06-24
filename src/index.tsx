import './wdyr'; // <--- Must be first import (when enabled)
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Router } from './Router';
import './Extensions';
import GlobalErrorBoundaryState from './Utilities/ErrorBoundaries/GlobalErrorBoundary';
import { VersionCheck } from './Utilities/VersionCheck';
import { MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { ConfigProvider } from './Contexts/ConfigProvider';
import { GlobalSnackbarProvider } from './Contexts/GlobalSnackbar';
import BackdropProvider from './Contexts/BackdropContext';

if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_ENABLE_AXE === 'true') {
    const axe = require('react-axe');
    axe(React, ReactDOM, 1000);
}

ReactDOM.render(
    <React.StrictMode>
        <GlobalErrorBoundaryState>
            <ConfigProvider>
                <VersionCheck>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                        <BackdropProvider>
                            <GlobalSnackbarProvider>
                                <Router />
                            </GlobalSnackbarProvider>
                        </BackdropProvider>
                    </MuiPickersUtilsProvider>
                </VersionCheck>
            </ConfigProvider>
        </GlobalErrorBoundaryState>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
