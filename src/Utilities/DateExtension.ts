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