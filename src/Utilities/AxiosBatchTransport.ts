import { AxiosInstance } from 'axios';
import Transport from 'winston-transport';
import _ from 'lodash';

interface AxiosBatchTransportOptions extends Transport.TransportStreamOptions {
    axios: AxiosInstance;
    throttleTimeInMillis?: number;
    loggingEndpoint: string;
}

interface LogMessage {
    message: string;
    time: Date;
    level: string;
    meta?: unknown;
}

export default class AxiosBatchTransport extends Transport {
    private throttledSend: _.DebouncedFunc<() => Promise<void>>;
    private logsToSend: Array<LogMessage>  = [];
    private axios: AxiosInstance;
    private loggingEndpoint: string;

    constructor(opts: AxiosBatchTransportOptions) {
        super(opts);
        const {
            throttleTimeInMillis = 30000,
            axios,
            loggingEndpoint
        } = opts;
        //
        // Consume any custom options here. e.g.:
        // - Connection information for databases
        // - Authentication information for APIs (e.g. loggly, papertrail,
        //   logentries, etc.).
        //

        // some log levels break with some ui logs
        // i.e. using json and logging an html element does not work
        this.throttledSend = _.throttle(this.send, throttleTimeInMillis, {
            leading: true,
            trailing: true,
        });
        this.axios = axios;
        this.loggingEndpoint = loggingEndpoint;
    }

    private async send(): Promise<void> {
        // TODO do we want to add a lock so that it can only be executing once at a time
        // in theory while the request is going out another one could come int
        // however it shouldn't matter because the array is replaced
        const logsToSend = this.logsToSend;
        this.logsToSend = [];
        if (logsToSend.length === 0) {
            // // eslint-disable-next-line no-console
            // console.debug('AxiosBatchTransport: Logs to send was empty');
            return;
        }
        try {
            await this.axios.post(this.loggingEndpoint, {
                logs: logsToSend
            });
            // // eslint-disable-next-line no-console
            // console.debug('AxiosBatchTransport: Successfully sent a batch of logs');
        } catch (e) {
            // Can't use the logger for this, infinite loop
            // eslint-disable-next-line no-console
            console.error('AxiosBatchTransport: Failed to send logs', e);
        }
    }

    async log(info: any, callback: any): Promise<void> {
        /**
         * In the example they use setImmediate however that does not seem to have great browser support
         * setTimouet 0 is equivalent
         * Emitting the logged even seems to make login freeze up... we should look into why this is happening
         * I don't know if there is any benefit to having it emit a logged event, unless we were observing it
         */
        setTimeout(() => {
            this.emit('logged', info);
        }, 0);

        const level = info.level;

        let log = [info.message];

        const splatSymbol = Symbol.for('splat');

        if(info[splatSymbol]) {
            log = [...log, ...info[splatSymbol]];
        }

        const logMessage: LogMessage = {
            message: log.join(' '),
            time: new Date(),
            level: level,
            meta: _.cloneDeep(info.meta)
        };
        this.logsToSend.push(logMessage);
        // Send it and forget about it
        this.throttledSend();

        // Perform the writing to the remote service
        callback();
    }
}
