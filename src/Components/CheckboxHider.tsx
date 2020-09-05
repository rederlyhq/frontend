import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

interface CheckboxHiderProps {
    defaultChecked?: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties;
    labelText: string;
    onChange?: (newValue: boolean) => void;
}

export const CheckboxHider: React.FC<CheckboxHiderProps> = ({
    defaultChecked = true,
    children,
    style,
    labelText,
    onChange
}) => {
    const [checked, setChecked] = useState<boolean>(defaultChecked);
    return (
        <>
            {checked && children}
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
                <Form.Label style={{
                    marginBottom: '0px'
                }}>{labelText}</Form.Label>
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
                />
            </Form.Group>
        </>
    );
};
