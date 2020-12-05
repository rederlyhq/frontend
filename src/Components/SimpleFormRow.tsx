import React from 'react';
import { Form } from 'react-bootstrap';
import * as _ from 'lodash';

interface SimpleFormRowProps {
    label: String;
    id: String;
    errmsg: String;
    [x: string]: any;
}

/**
 * A simple reusable form row.
 * 
 * @param label - Form label
 * @param id - ID to set on the input (and label's for) fields.
 * @param errmsg - Error to display when validation fails.
 */
export const SimpleFormRow: React.FC<SimpleFormRowProps> = ({label, id, errmsg, ...passedProps}) => {
    // controlId sets the id, so it throws errors when its included.
    const safeProps: object = _.omit(passedProps, (['label', 'id']));

    return (
        <Form.Group controlId={`${id}-group`}>
            <Form.Label>{label}</Form.Label>
            <Form.Control
                { ...safeProps}
            />
            <Form.Control.Feedback type="invalid">{<span>{errmsg}</span>}</Form.Control.Feedback>
        </Form.Group>
    );
};
export default SimpleFormRow;