import { Backdrop, CircularProgress } from '@material-ui/core';
import React, { useState } from 'react';

interface BackdropProviderProps {
    children: React.ReactNode
}

type BackdropContextContextProperties = React.Dispatch<React.SetStateAction<boolean>> | null;
const BackdropContext = React.createContext<BackdropContextContextProperties>(null);

export const useBackdropContext = () => React.useContext(BackdropContext);

export const BackdropProvider: React.FC<BackdropProviderProps> = ({children}) => {
    const [showBackdropLoading, setShowBackdropLoading] = useState<boolean>(true);

    return (<>
        <Backdrop open={showBackdropLoading}>
            <CircularProgress/>
        </Backdrop>
        <BackdropContext.Provider value={setShowBackdropLoading}>
            {children}
        </BackdropContext.Provider>
    </>
    );
};

export default BackdropProvider;