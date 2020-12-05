import { useState } from 'react';

// via https://medium.com/javascript-in-plain-english/useful-custom-hooks-for-tired-react-devs-f2f602dc754f
const useLoading = (action: Function) => {
    const [loading, setLoading] = useState(false);

    const doAction = (...args: any[]) => {
        setLoading(true);
        return action(...args).finally(() => setLoading(false));
    };

    return [doAction, loading];
};

export default useLoading;
