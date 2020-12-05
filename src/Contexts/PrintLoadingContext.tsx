import React, { useReducer, useEffect } from 'react';
import logger from '../Utilities/Logger';
import _ from 'lodash';

type PrintLoadingProps = {
    dispatch: React.Dispatch<PrintLoadingDispatch>
};

const PrintLoadingContext = React.createContext<Partial<PrintLoadingProps>>({});

type Props = {
  children: React.ReactNode;
};

type AddExpectedDispatch = {type: PrintLoadingActions.ADD_EXPECTED_PROMISE_COUNT, expected: number}
type AddPromiseDispatch = {type: PrintLoadingActions.ADD_PROMISE | PrintLoadingActions.ADD_PROMISE_INCR_EXPECTED, payload: Promise<unknown>}
type ResetExpectedDispatch = {type: PrintLoadingActions.RESET_EXPECTED_COUNT}
type PrintDispatch = {type: PrintLoadingActions.PRINT, expected: number}
type PrintLoadingDispatch = AddExpectedDispatch | AddPromiseDispatch | ResetExpectedDispatch | PrintDispatch;

const print = _.debounce(window.print, 3000, {leading: false, trailing: true});

interface PrintLoadingState {
    expected: number;
    arr: Promise<unknown>[];
}

export enum PrintLoadingActions {
    ADD_PROMISE,
    ADD_PROMISE_INCR_EXPECTED,
    ADD_EXPECTED_PROMISE_COUNT,
    RESET_EXPECTED_COUNT,
    PRINT,
}

const reducer = (state: PrintLoadingState, action: PrintLoadingDispatch): PrintLoadingState => {
    switch(action.type) {
    case PrintLoadingActions.RESET_EXPECTED_COUNT:
        logger.debug('Printing state reset.');
        return {expected: 1, arr: []};
    case PrintLoadingActions.ADD_EXPECTED_PROMISE_COUNT:
        return {expected: state.expected + action.expected, arr: state.arr};
    case PrintLoadingActions.ADD_PROMISE_INCR_EXPECTED:
        logger.debug('Promise received');
        // You must use the other action to increase expected counts.
        return {expected: state.expected+1, arr: [...state.arr, action.payload]};
    case PrintLoadingActions.ADD_PROMISE:
        logger.debug('Promise received');
        // You must use the other action to increase expected counts.
        return {expected: state.expected, arr: [...state.arr, action.payload]};
    case PrintLoadingActions.PRINT:
        if (state.expected !== action.expected) {
            logger.debug(`Skipping early print call from ${action.expected} -> ${state.expected}`);
            return state;
        }
        logger.debug(`Printing because ${state.expected} == ${action.expected}`);
        print();
        return state;
    }
    return state;
};

export const usePrintLoadingContext = () => React.useContext(PrintLoadingContext);

export const PrintLoadingProvider: React.FC<Props>  = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, {expected: 1, arr: []});

    useEffect(()=>{
        if (state.expected > 1 && state.arr.length >= state.expected && Promise.allSettled(state.arr)) {
            logger.debug(`${state.expected} components have loaded, printing in two seconds.`);

            setTimeout(() => {
                dispatch({
                    type: PrintLoadingActions.PRINT,
                    expected: state.expected,
                });
            }, 10000);
        }
    }, [state]);

    return (
        <PrintLoadingContext.Provider value={{
            dispatch
        }}>
            {children}
        </PrintLoadingContext.Provider>
    );
};

export const useCurrentProblemState = () => React.useContext(PrintLoadingContext);
