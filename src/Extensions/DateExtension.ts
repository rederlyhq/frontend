import moment from 'moment';

// We need this declare because this file has an import
declare global {
    interface Date {
        toMoment(): moment.Moment;
    }

    interface String {
        toMoment(): moment.Moment;
    }
}

Date.prototype.toMoment = function (): moment.Moment {
    return moment(this);
};

String.prototype.toMoment = Date.prototype.toMoment;

// https://stackoverflow.com/a/45517745
declare module 'moment' {
    interface Moment {
        formattedFromNow(omitSuffix?: boolean): string;
    }
}

(moment.fn as any).formattedFromNow = function (omitSuffix: boolean = false): string {
    // This is the command I used to test in the console
    // moment(moment().add(3500, 'seconds').diff(moment())).utc().format('H:mm:ss');
    const diff = this.diff(moment());
    // If the diff is greater than a day do not use granular countdown
    if (diff > 86400000) {
        return this.fromNow(omitSuffix);
    } else {
        const result = moment(diff).utc().format('H:mm:ss');
        if (omitSuffix) {
            return result;
        } else {
            return `in ${result}`;
        }
    }
};
