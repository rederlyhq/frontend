import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logger from '../Utilities/Logger';

interface RederlyConfig {
    paymentURL: string;
    domain: string;
}

type ConfigContextProperties = RederlyConfig;

const ConfigContext = React.createContext<ConfigContextProperties | undefined>(undefined);

export const useConfigContext = () => React.useContext(ConfigContext);

export const ConfigProvider: React.FC<{}>  = ({ children }) => {
    const [config, setConfig] = useState<RederlyConfig>();
    
    const getConfig = () => {
        axios.get<RederlyConfig>(`/config.json?cache_bust=${new Date().getTime()}`)
            .then(resp => setConfig(resp.data))
            .catch(err => {
                logger.error('Failed to load frontend config file.', err);
            });
    };

    useEffect(getConfig, []);


    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
};
