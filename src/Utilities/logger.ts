import winston from 'winston';
import BrowserConsole from 'winston-transport-browserconsole';

let level = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

const transports = {
    console: new BrowserConsole(
        {
            format: winston.format.simple(),
            level: level,
        },
    ),
};

const logger = winston.createLogger({
    level: level,
    format: winston.format.json(),
    // defaultMeta: { service: 'user-service' },
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

export default logger;