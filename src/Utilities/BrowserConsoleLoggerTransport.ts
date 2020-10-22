import Transport from 'winston-transport';
import _ from 'lodash';

export default class BrowserConsoleLoggerTransport extends Transport {
    constructor(opts?: Transport.TransportStreamOptions) {
        super(opts);
        //
        // Consume any custom options here. e.g.:
        // - Connection information for databases
        // - Authentication information for APIs (e.g. loggly, papertrail, 
        //   logentries, etc.).
        //
    }

    log(info: any, callback: any): void {
        /**
         * In the example they use setImmediate however that does not seem to have great browser support
         * setTimouet 0 is equivalent
         * Emitting the logged even seems to make login freeze up... we should look into why this is happening
         * I don't know if there is any benefit to having it emit a logged event, unless we were observing it
         */
        setTimeout(() => {
            this.emit('logged', info);
        }, 0);
        const level = (info.level in console ? info.level : 'log') as keyof Console;

        let log = [info.message];
        
        const splatSymbol = _.find(Object.getOwnPropertySymbols(info), (elm: Symbol) => {
            return elm.toString() === 'Symbol(splat)';
        });

        if(splatSymbol) {
            log = [...log, ...info[splatSymbol]];
        }
        
        // eslint-disable-next-line no-console
        console[level](...log);
        
        // Perform the writing to the remote service
        callback();
    }
}
