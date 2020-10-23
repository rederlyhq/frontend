import winston from 'winston';
import AxiosRequest from '../Hooks/AxiosRequest';
import AxiosBatchTransport from './AxiosBatchTransport';
import BrowserConsoleLoggerTransport from './BrowserConsoleLoggerTransport';

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
    defaultMeta: { service: 'user-service' },
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
