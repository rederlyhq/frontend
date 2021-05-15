import React from 'react';
import InfoIcon from '@material-ui/icons/Info';
import { Tooltip } from '@material-ui/core';

interface InfoContextProps {
    text: string;
    containerStyle?: React.CSSProperties;
    titleStyle?: React.CSSProperties;
}

export const InfoContext: React.FC<InfoContextProps> = ({
    text,
    containerStyle,
    titleStyle
}) => {
    return <Tooltip  title={<div style={{fontSize: '1.2em', ...titleStyle}} >{text}</div>} placement='bottom' style={{
        color: '#939393',
        padding: '4px',
        margin: '-2px',
        cursor: 'pointer',
        ...containerStyle
    }}>
        <InfoIcon />
    </Tooltip>;
};