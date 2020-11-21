import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import promiseOnLoad from '../../Utilities/promiseOnLoad';
import { usePrintLoadingContext, PrintLoadingActions } from '../../Contexts/PrintLoadingContext';

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
            console.log('No ref');
            return;
        }
        console.log('Dispatching a new promise.');
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
