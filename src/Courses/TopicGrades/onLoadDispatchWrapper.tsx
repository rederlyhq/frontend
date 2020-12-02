import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import promiseOnLoad from '../../Utilities/promiseOnLoad';
import { usePrintLoadingContext, PrintLoadingActions } from '../../Contexts/PrintLoadingContext';
import logger from '../../Utilities/Logger';

interface OnLoadInterface {
    onLoad: Function
}

interface OnLoadDispatchWrapperProps {
    children: React.ReactElement;
}

export const OnLoadDispatchWrapper: React.FC<OnLoadDispatchWrapperProps> = ({children}) => {
    const ref = useRef<HTMLElement>(null);
    const {dispatch} = usePrintLoadingContext();

    useEffect(()=>{
        if (_.isNil(ref) || _.isNil(ref.current)) {
            logger.debug('No ref');
            return;
        }

        logger.info('Adding a promise for a single Image');
        dispatch?.({
            type: PrintLoadingActions.ADD_PROMISE,
            payload: promiseOnLoad(ref.current)
        });
    }, [ref]);

    if (_.isNil(children)) {
        return null;
    }

    return (
        React.cloneElement(children, {ref: ref})
    );
};

export default OnLoadDispatchWrapper;
