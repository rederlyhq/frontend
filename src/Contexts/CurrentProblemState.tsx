import React, { useState } from 'react';

type CurrentProblemStateProps = {
    lastSavedAt?: moment.Moment|null;
    lastSubmittedAt?: moment.Moment|null;
    setLastSavedAt?: (val: moment.Moment|null) => void;
    setLastSubmittedAt?: (val: moment.Moment|null) => void;
};

const ProblemStateContext = React.createContext<Partial<CurrentProblemStateProps>>({});

type Props = {
  children: React.ReactNode;
};

export const ProblemStateProvider = ({ children }: Props) => {
    const [lastSavedAt, setLastSavedAt] = useState<moment.Moment|null>(null);
    const [lastSubmittedAt, setLastSubmittedAt] = useState<moment.Moment|null>(null);

    React.useEffect(() => {
        // initialize with historical data? Still might be null
        // setLastSavedAt(get updatedAt from grades);
        // setLastSubmittedAt(get createdAt from latest workbook);
    }, []);

    return (
        <ProblemStateContext.Provider value={{ 
            lastSavedAt, 
            lastSubmittedAt, 
            setLastSavedAt, 
            setLastSubmittedAt 
        }}>
            {children}
        </ProblemStateContext.Provider>
    );
};

export const useCurrentProblemState = () => React.useContext(ProblemStateContext);
