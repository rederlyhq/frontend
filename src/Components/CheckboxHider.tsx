import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

export enum CheckboxHiderChildrenPosition {
    BEFORE='BEFORE',
    AFTER='AFTER'
}

interface CheckboxHiderProps {
    defaultChecked?: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties;
    labelText: string;
    onChange?: (newValue: boolean) => void;
    position?: CheckboxHiderChildrenPosition;
    stackLabel?: boolean;
}

export const CheckboxHider: React.FC<CheckboxHiderProps> = ({
    defaultChecked = true,
    children,
    style,
    labelText,
    onChange,
    position = CheckboxHiderChildrenPosition.BEFORE,
    stackLabel = true
}) => {
    const [checked, setChecked] = useState<boolean>(defaultChecked);
    return (
        <>
            {checked && position === CheckboxHiderChildrenPosition.BEFORE && children}
            <Form.Group
                className="unhighlightable"
                style={{
                    marginBottom: '0px',
                    ...style
                }}
                onClick={() => {
                    const newValue = !checked;
                    setChecked(newValue);
                    onChange?.(newValue);
                }}
            >
                {stackLabel && 
                <Form.Label style={{
                    marginBottom: '0px'
                }}>{labelText}</Form.Label>}
                <Form.Check
                    style={{
                        textAlign: 'center'
                    }}
                    checked={checked}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const newValue = event.target.checked;
                        setChecked(newValue);
                        onChange?.(newValue);
                    }}
                    label={!stackLabel ? labelText : undefined}
                />
            </Form.Group>
            {checked && position === CheckboxHiderChildrenPosition.AFTER && children}
        </>
    );
};
