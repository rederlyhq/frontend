import React from 'react';
import { Form } from 'react-bootstrap';

interface SimpleFormRowProps {
    label: String;
    id: String;
    [x: string]: any;
}

export const SimpleFormRow: React.FC<SimpleFormRowProps> = ({label, id, ...props}) => {
    return (
        <Form.Group controlId={`${id}-group`}>
            <Form.Label>{label}</Form.Label>
            <Form.Control
                { ...props}
            />
            <Form.Control.Feedback type="invalid">{<span>An Institutional is required.</span>}</Form.Control.Feedback>
        </Form.Group>
    );
};
export default SimpleFormRow;