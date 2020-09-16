import React from 'react';
import { ComponentToggleButton } from './ComponentToggleButton';
import { FaPencilAlt } from 'react-icons/fa';
import { Button } from 'react-bootstrap';

interface EditToggleButtonProps {
    defaultSelectedState?: boolean;
    selectedState?: boolean;
    selectedStateJSX?: JSX.Element;
    notSelectedStateJSX?: JSX.Element;
    style?: React.CSSProperties;
    onClick?: (newState: boolean, oldState: boolean)=>void;
}

const selectedButton = (
    <Button variant='primary'>
        <FaPencilAlt /> View Mode
    </Button>
);

const notSelectedButton = (
    <Button variant='outline-primary'>
        <FaPencilAlt /> Edit Mode
    </Button>
);

export const EditToggleButton: React.FC<EditToggleButtonProps> = ({
    defaultSelectedState,
    selectedState,
    style,
    onClick
}) => {
    return <ComponentToggleButton
        selectedStateJSX={selectedButton}
        notSelectedStateJSX={notSelectedButton}
        defaultSelectedState={defaultSelectedState}
        selectedState={selectedState}
        style={style}
        onClick={onClick}
    />;
};
