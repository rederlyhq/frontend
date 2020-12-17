import React from 'react';
import logger from '../Utilities/Logger';
import _ from 'lodash';

type PrintLoadingProps = {
    dispatch: (action: PrintLoadingDispatch) => PrintLoadingState
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

export const usePrintLoadingContext = () => React.useContext(PrintLoadingContext);

export const PrintLoadingProvider: React.FC<Props>  = ({ children }) => {
    const timeout = React.useRef<NodeJS.Timeout | null>(null);
    const state: PrintLoadingState = {expected: 0, arr: []};

    const reducer = (state: PrintLoadingState, action: PrintLoadingDispatch): PrintLoadingState => {
        switch(action.type) {
        case PrintLoadingActions.RESET_EXPECTED_COUNT:
            logger.debug('PrintLoadingContext: Printing state reset.', state.expected, state.arr.length);
            state.expected = 1;
            state.arr = [];
            break;
        case PrintLoadingActions.ADD_EXPECTED_PROMISE_COUNT:
            state.expected = state.expected + action.expected;
            break;
        case PrintLoadingActions.ADD_PROMISE_INCR_EXPECTED:
            logger.debug('PrintLoadingContext: Promise received', state.expected, state.arr.length);
            // You must use the other action to increase expected counts.
            state.expected = state.expected+1;
            state.arr.push(action.payload);
            break;
        case PrintLoadingActions.ADD_PROMISE:
            logger.debug('PrintLoadingContext: Promise received', state.expected, state.arr.length);
            // You must use the other action to increase expected counts.
            state.arr.push(action.payload);

            // If a promise was added and there's already a timeout waiting to be evaluated, remove it.
            if (!_.isNull(timeout.current)) {
                clearTimeout(timeout.current);
            }
            
            // If a promise is added and we meet expectations, set a timeout to wait for the promises to finish.
            if (state.expected > 1 && state.arr.length >= state.expected) {
                timeout.current = setTimeout(async () => {
                    if (await Promise.allSettled(state.arr)) {
                        logger.debug(`${state.expected} components have loaded, printing in two seconds.`);
                        dispatch({
                            type: PrintLoadingActions.PRINT,
                            expected: state.expected,
                        });
                    }
                }, 0);
            }
            break;
        case PrintLoadingActions.PRINT:
            if (state.expected !== action.expected) {
                logger.debug(`PrintLoadingContext: Skipping early print call from ${action.expected} -> ${state.expected}`, state.expected, state.arr.length);
                return state;
            }
            logger.debug(`PrintLoadingContext: Printing because ${state.expected} == ${action.expected}`, state.expected, state.arr.length);
            print();
            return state;
        }
        return state;
    };

    const dispatch = _.partial(reducer, state);

    return (
        <PrintLoadingContext.Provider value={{
            dispatch
        }}>
            {children}
        </PrintLoadingContext.Provider>
    );
};

export const useCurrentProblemState = () => React.useContext(PrintLoadingContext);
