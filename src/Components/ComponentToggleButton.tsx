import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import _ from 'lodash';

interface ComponentToggleButtonProps {
    defaultSelectedState?: boolean;
    selectedState?: boolean;
    selectedStateJSX?: JSX.Element;
    notSelectedStateJSX?: JSX.Element;
    style?: React.CSSProperties;
    onClick?: (newState: boolean, oldState: boolean)=>void;
}

/**
 * This component renders a button, and displays a Modal to log in with it.
 * @param header - Text to show in Button and Modal Header
 * @param children - Content to render in Modal Body
 * 
 * Note: React-Bootstrap 1.0.0 throws a warning for deprecated usage of findDOMNode.
 *       This issue is being tracked here: https://github.com/react-bootstrap/react-bootstrap/issues/5075
 */
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
        <div style={style} onClick={onClick} role="button" tabIndex={0} onKeyPress={onClick} >
            {renderAppropriateJSX()}
        </div>
    );
};
