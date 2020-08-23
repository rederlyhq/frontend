import React, { useState } from 'react';
import _ from 'lodash';

interface ComponentToggleButtonProps {
    defaultSelectedState?: boolean;
    selectedState?: boolean;
    selectedStateJSX?: JSX.Element;
    notSelectedStateJSX?: JSX.Element;
    style?: React.CSSProperties;
    onClick?: (newState: boolean, oldState: boolean)=>void;
}

export const ComponentToggleButton: React.FC<ComponentToggleButtonProps> = ({
    defaultSelectedState = false,
    selectedState: selectedStateProp,
    selectedStateJSX = <div>selected</div>,
    notSelectedStateJSX = <div>not selected</div>,
    style,
    onClick: onClickProp
}) => {
    const [selectedState, setSelectedState] = useState(defaultSelectedState);
    if(!_.isNil(selectedStateProp) && selectedStateProp !== selectedState) {
        setSelectedState(selectedStateProp);
    }

    const renderAppropriateJSX = (): JSX.Element => {
        if(selectedState) {
            return selectedStateJSX;
        } else {
            return notSelectedStateJSX;
        }
    };

    const onClick = () => {
        if(_.isNil(selectedStateProp)) {
            setSelectedState(!selectedState);
        } else {
            onClickProp?.(!selectedState, selectedState);
        }
    };

    return (
        <span style={style} onClick={onClick} role="button" tabIndex={0} onKeyPress={onClick} >
            {renderAppropriateJSX()}
        </span>
    );
};
