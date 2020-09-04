import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import _ from 'lodash';

const FILE_LOG_TAG = 'MomentReacter';
interface NextMomentResult {
    theMoment: moment.Moment;
    theDiff: number;
}

const nextMoment = (referenceMoment: moment.Moment, moments: Array<moment.Moment>): NextMomentResult | null => {
    let result: NextMomentResult | null = null;
    moments.forEach(theMoment => {
        // future negative, present positive
        const theDiff = referenceMoment.diff(theMoment);
        if (theDiff >= 0 && (_.isNil(result) || theDiff < result.theDiff)) {
            result = {
                theMoment,
                theDiff
            };
        }
    });
    return result;
};

interface MomentReacterProps {
    absolute?: boolean;
    intervalInMillis?: number;
    children: (moment: moment.Moment) => JSX.Element;
    stopMoment?: moment.Moment;
    significantMoments?: Array<moment.Moment>;
    offsetInMillis?: number;
    stop?: boolean;
    logTag?: string
}

export const MomentReacter: React.FC<MomentReacterProps> = ({
    absolute = false,
    intervalInMillis,
    children,
    stopMoment,
    significantMoments,
    offsetInMillis,
    stop,
    logTag = 'untagged'
}) => {
    const TAG = `${FILE_LOG_TAG}---${logTag}`;
    const [reactiveMoment, setReactiveMoment] = useState<moment.Moment>(moment());
    const currentTimeoutHandle = useRef<NodeJS.Timeout | null>(null);
    
    if(stop === true && !_.isNil(currentTimeoutHandle.current)) {
        clearTimeout(currentTimeoutHandle.current);
    }
    useEffect(() => {
        if(stop === true) {
            return;
        }
        const currentMoment = moment();
        let timeoutTime = intervalInMillis;

        if (absolute) {
            if(_.isNil(intervalInMillis)) {
                console.error(`${TAG} Cannot use absolute if intervalInMillis is not provided, will use significantMoments if they are provided only`);
            } else {
                // We need to mod by the intervalInMillis because this number can be greater
                // For example let's say we want to run this every minute on the half minute
                // intervalInMillis = 60000, offsetInMillis = 30000
                // There is 45 seconds until the next minute, ad the 30 and your at a minute and 15 seconds
                // but you really want to run in 15 seconds
                timeoutTime = (intervalInMillis - (currentMoment.toDate().getTime() % intervalInMillis) + (offsetInMillis ?? 0)) % intervalInMillis;
            }
        } else {
            if(!_.isNil(offsetInMillis)) {
                console.warn('offsetInMillis is only used with absolute time interval');
            }
        }

        if(!_.isNil(significantMoments)) {
            const theNextMomentResult = nextMoment(currentMoment, significantMoments);
            if(!_.isNil(theNextMomentResult)) {
                if(_.isNil(timeoutTime)) {
                    timeoutTime = theNextMomentResult.theDiff;
                } else {
                    timeoutTime = Math.min(theNextMomentResult.theDiff, timeoutTime);
                }
            }
        }

        if(_.isNil(stopMoment) && currentMoment.isAfter(stopMoment)) {
            console.debug(`${TAG} Hit the stop moment`);
            return;
        }

        if(_.isNil(timeoutTime)) {
            console.error(`${TAG} No timeoutTime could be calculated`);
            return;
        }
        console.debug(`${TAG} timeoutTime ${timeoutTime}`);
        console.debug(`${TAG} moment().add(timeoutTime, 'milliseconds') ${moment().add(timeoutTime, 'milliseconds')}`);
        if(!_.isNil(currentTimeoutHandle.current)) {
            clearTimeout(currentTimeoutHandle.current);
        }
        const newTimeoutHandle = setTimeout(() => setReactiveMoment(moment()), timeoutTime);
        currentTimeoutHandle.current = newTimeoutHandle;
    }, [reactiveMoment]);
    
    // I don't use reactive moment here since there is no guarentee this was run immediately, it is more accurate to use a new moment
    const currentMoment = moment();
    console.debug(`${TAG} currentMoment ${currentMoment}`);
    // TODO renders twice, not sure why
    return children(currentMoment);
};
