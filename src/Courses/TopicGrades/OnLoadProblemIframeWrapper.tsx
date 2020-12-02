import React, { useRef } from 'react';
import _ from 'lodash';
import { usePrintLoadingContext, PrintLoadingActions } from '../../Contexts/PrintLoadingContext';

interface OnLoadInterface {
    onLoad: Function
}

interface OnLoadProblemIframeWrapperProps {
    children: React.ReactElement;
}

export const OnLoadProblemIframeWrapper: React.FC<OnLoadProblemIframeWrapperProps> = ({children}) => {
    const resolveRef = useRef<(value?: unknown) => void>(()=>{});
    const {dispatch} = usePrintLoadingContext();

    const getLoadingState = (loading: any) => {
        if (loading) {
            dispatch?.({
                type: PrintLoadingActions.ADD_PROMISE,
                payload: new Promise((resolve) => {
                    resolveRef.current = resolve;
                })
            });
        } else {
            resolveRef.current?.();
        }
    };

    if (_.isNil(children)) {
        return null;
    }

    return (
        React.cloneElement(children, {propagateLoading: getLoadingState})
    );
};

export default OnLoadProblemIframeWrapper;
