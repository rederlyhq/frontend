import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

interface CheckboxHiderProps {
    defaultChecked?: boolean;
    children: React.ReactNode;
    style?: React.CSSProperties;
    labelText: string;
}

export const CheckboxHider: React.FC<CheckboxHiderProps> = ({
    defaultChecked = true,
    children,
    style,
    labelText
}) => {
    const [checked, setChecked] = useState<boolean>(defaultChecked);
    return (
        <>
            {checked && children}
            <Form.Group style={{
                marginBottom: '0px',
                ...style
            }}>
                <Form.Label style={{
                    marginBottom: '0px'
                }}>{labelText}</Form.Label>
                <Form.Check
                    style={{
                        textAlign: 'center'
                    }}
                    checked={checked}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setChecked(event.target.checked);
                    }}
                />
            </Form.Group>
        </>
    );
};
