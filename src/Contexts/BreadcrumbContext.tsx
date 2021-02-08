import React, { useState } from 'react';
import logger from '../Utilities/Logger';
import _ from 'lodash';

export enum NamedBreadcrumbs {
    COURSE = 'COURSE',
    TOPIC = 'TOPIC',
}

type BreadcrumbState = {
    [pathComponent in NamedBreadcrumbs]?: string;
};

type BreadcrumbLookupContext = {
    breadcrumbLookup: BreadcrumbState;
    setBreadcrumbLookup?: (state: BreadcrumbState) => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbLookupContext>({breadcrumbLookup: {}});

type Props = {
  children: React.ReactNode;
};

export const useBreadcrumbLookupContext = () => React.useContext(BreadcrumbContext);

export const BreadcrumbLookupProvider: React.FC<Props>  = ({ children }) => {
    const [breadcrumbLookup, setBreadcrumbLookup] = useState<BreadcrumbState>({});

    const setBreadcrumbLookupWrapper = (state: BreadcrumbState) => setBreadcrumbLookup(oldstate => ({...oldstate, ...state}));

    return (
        <BreadcrumbContext.Provider value={{
            // TODO: rename to update
            breadcrumbLookup, setBreadcrumbLookup: setBreadcrumbLookupWrapper
        }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};

export const useCurrentProblemState = () => React.useContext(BreadcrumbContext);
