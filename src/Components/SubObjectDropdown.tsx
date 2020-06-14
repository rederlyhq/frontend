import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import _ from 'lodash';

interface SubObjectDropdownProps {
    eventKeyState: string;
    title: string;
    subObjArray: Array<any>;
    style?: any;
}

/**
 * This Dropdown button renders a dynamic list of selectable subobject names.
 * Intended use case: List of 
 */
export const SubObjectDropdown: React.FC<SubObjectDropdownProps> = ({eventKeyState, title, subObjArray, style}) => {
    return (
        <NavDropdown title={title} id={`${title}-dropdown`} active={_.startsWith(eventKeyState, title)} style={style} drop='right'>
            {subObjArray.map(obj => (
                <NavDropdown.Item key={obj.id} eventKey={`${title}-${obj.id}`}>{obj.name}</NavDropdown.Item>
            ))}
        </NavDropdown>
    );
};

export default SubObjectDropdown;