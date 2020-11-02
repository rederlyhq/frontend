import React from 'react';
import logger from '../Logger';

interface GlobalErrorBoundaryProps {
    children: React.ReactNode;
}
interface GlobalErrorBoundaryState {
    hasError: boolean;
}

const TAG = 'GlobalErrorBoundary';

/**
 * These are for the errors not thrown in the react lifecycle
 * i.e. if an error is thrown in a set timeout
 */
window.addEventListener('unhandledrejection', event => {
    logger.error(TAG, 'Unhandled Promise Rejection', event.reason);
});

window.addEventListener('error', errorEvent => {
    logger.error(TAG, 'Uncaught Error', errorEvent.error);
});

export default class GlobalErrorBoundary extends React.Component<GlobalErrorBoundaryProps, GlobalErrorBoundaryState> {
    constructor(props: GlobalErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false
        };
    }

    static getDerivedStateFromError() {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        logger.error(TAG, 'React Uncaught Error: ', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (<>
                <h1>Something went wrong.</h1>
                <h2>An error has been reported to support. Please refresh the page.</h2>
            </>);
        }

        return this.props.children;
    }
}
