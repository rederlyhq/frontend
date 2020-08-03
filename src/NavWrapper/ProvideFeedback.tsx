import React, { useState } from 'react';
import { Button, Modal, FormControl, FormLabel, FormGroup, Spinner, Form, } from 'react-bootstrap';
import AxiosRequest from '../Hooks/AxiosRequest';

export const ProvideFeedback: React.FC<any> = () => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [enabled, setEnabled] = useState(true);
    const [validated, setValidated] = useState(false);

    const submitFeedback = async () => {
        try {
            setMessage('');
            setSubmitting(true);
            setEnabled(false);
            await AxiosRequest.post('/support', {
                description,
                summary,
            });
            setMessage('Thank you, your feedback has been submitted.');
            setSubmitting(false);
            setTimeout(() => {
                reset();
            }, 3000);
        } catch(e) {
            setSubmitting(false);
            setEnabled(true);
            setMessage(e.response.data.message);
        }
    };

    const reset = () => {
        setEnabled(true);
        setSubmitting(false);
        setMessage('');
        setDescription('');
        setSummary('');
        setShowFeedbackModal(false);
        setValidated(false);
    };

    const submit = (event: any) => {
        const form = event.currentTarget;
        event.preventDefault();

        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            submitFeedback();
        }
  
        setValidated(true);
    };
    const cancel = reset;
    
    return (
        <>
            <Button variant="outline-light" onClick={() => setShowFeedbackModal(true)}>
                Provide feedback
            </Button>

            <Modal
                show={showFeedbackModal}
                onHide={cancel}
                dialogClassName="modal-90w"
            >
                <Form noValidate validated={validated} onSubmit={submit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                        Provide Feedback
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {submitting && <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>}
                        {message && <p>{message}</p>}
                        <FormGroup controlId='provide-feedback-summary'>
                            <FormLabel>
                                Summary:
                            </FormLabel>
                            <FormControl
                                required
                                defaultValue='' 
                                size='lg'
                                readOnly={!enabled}
                                onChange={(
                                    ev: React.ChangeEvent<HTMLInputElement>,
                                ): void => setSummary(ev.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">{<span>Feedback requires a summary.</span>}</Form.Control.Feedback>
                        </FormGroup>
                        <FormGroup controlId='provide-feedback-description'>
                            <FormLabel>
                                Description:
                            </FormLabel>
                            <FormControl
                                required
                                defaultValue='' 
                                size='lg'
                                as="textarea" rows="3"
                                readOnly={!enabled}
                                onChange={(
                                    ev: React.ChangeEvent<HTMLInputElement>,
                                ): void => setDescription(ev.target.value)}
                            />
                            <Form.Control.Feedback type="invalid">{<span>Feedback requires a description.</span>}</Form.Control.Feedback>
                        </FormGroup>
                        <FormGroup controlId='provide-feedback-test'>
                        </FormGroup>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={cancel}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};