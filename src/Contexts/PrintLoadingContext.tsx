import React, { useReducer } from 'react';
import logger from '../Utilities/Logger';

type PrintLoadingProps = {
    isDone: Promise<unknown>[],
    dispatch: React.Dispatch<PrintLoadingDispatch>
};

const PrintLoadingContext = React.createContext<Partial<PrintLoadingProps>>({isDone: []});

type Props = {
  children: React.ReactNode;
};

type PrintLoadingDispatch = {type: PrintLoadingActions, payload: Promise<unknown>}

export enum PrintLoadingActions {
    ADD_PROMISE
}

const reducer = (state: Promise<unknown>[], action: PrintLoadingDispatch): Promise<unknown>[] => {
    logger.debug('Adding a promise to the Loading context');
    switch(action.type) {
    case PrintLoadingActions.ADD_PROMISE:
        return [...state, action.payload];
    }
    return state;
};

export const usePrintLoadingContext = () => React.useContext(PrintLoadingContext);

export const PrintLoadingProvider: React.FC<Props>  = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, []);

    return (
        <PrintLoadingContext.Provider value={{
            isDone: state,
            dispatch
        }}>
            {children}
        </PrintLoadingContext.Provider>
    );
};

export const useCurrentProblemState = () => React.useContext(PrintLoadingContext);
