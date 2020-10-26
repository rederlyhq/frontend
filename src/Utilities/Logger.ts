import winston from 'winston';
import { getUserIdNoRedirect } from '../Enums/UserRole';
import AxiosRequest from '../Hooks/AxiosRequest';
import AxiosBatchTransport from './AxiosBatchTransport';
import BrowserConsoleLoggerTransport from './BrowserConsoleLoggerTransport';
import { version } from '../../package.json';

let level = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

const transports = {
    console: new BrowserConsoleLoggerTransport(
        {
            format: winston.format.simple(),
            level: level,
        },
    ),
    server: new AxiosBatchTransport({
        level: 'error',
        axios: AxiosRequest,
        loggingEndpoint: '/utility/client-logs',
        format: winston.format.simple(),
    })
};

const logger = winston.createLogger({
    level: level,
    format: winston.format.simple(),
    defaultMeta: {
        meta: {
            get userId() { return getUserIdNoRedirect() },
            get location() { return window.location.href },
            version: version
        }
    },
    transports: Object.values(transports),
    
});

declare global {
    interface Window {
        logger: winston.Logger;
        setLogLevel(level: string): void;
    }
}


window.logger = logger;
window.setLogLevel = (level: string) => {
    transports.console.level = level;
};


// const logger = console;
export default logger;
