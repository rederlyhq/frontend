import React, { useState } from 'react';

export enum NamedBreadcrumbs {
    COURSE = 'COURSE',
    TOPIC = 'TOPIC',
}

type BreadcrumbState = {
    [pathComponent in NamedBreadcrumbs]?: string;
};

type BreadcrumbLookupContext = {
    breadcrumbLookup: BreadcrumbState;
    updateBreadcrumbLookup?: (state: BreadcrumbState) => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbLookupContext>({breadcrumbLookup: {}});

type Props = {
  children: React.ReactNode;
};

export const useBreadcrumbLookupContext = () => React.useContext(BreadcrumbContext);

export const BreadcrumbLookupProvider: React.FC<Props>  = ({ children }) => {
    const [breadcrumbLookup, updateBreadcrumbLookup] = useState<BreadcrumbState>({});

    const updateBreadcrumbLookupWrapper = (state: BreadcrumbState) => updateBreadcrumbLookup(oldstate => ({...oldstate, ...state}));

    return (
        <BreadcrumbContext.Provider value={{
            breadcrumbLookup, updateBreadcrumbLookup: updateBreadcrumbLookupWrapper
        }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};
