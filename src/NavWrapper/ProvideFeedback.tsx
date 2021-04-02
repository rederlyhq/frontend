import React, { useRef, useState } from 'react';
import { Button, Modal, FormControl, FormLabel, FormGroup, Spinner, Form } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import logger from '../Utilities/Logger';
import _ from 'lodash';
import { version } from '../../package.json';
import { createSupportTicket } from '../APIInterfaces/BackendAPI/Requests/SupportRequests';
import { useMUIAlertState } from '../Hooks/useAlertState';
import { Alert as MUIAlert } from '@material-ui/lab';

enum ProvideFeedbackState {
    READY='READY',
    SUBMITTING='SUBMITTING',
    SUBMITTED='SUBMITTED'
}
export const ProvideFeedback: React.FC<any> = () => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [{ message, severity }, setUpdateAlert] = useMUIAlertState();
    const [state, setState] = useState<ProvideFeedbackState>(ProvideFeedbackState.READY);
    const [validated, setValidated] = useState(false);
    const history = useHistory();
    const resetTimeout = useRef<NodeJS.Timeout | null>(null);

    const clearResetTimeout = () => {
        if(!_.isNil(resetTimeout.current)) {
            clearTimeout(resetTimeout.current);
            resetTimeout.current = null;
        }
    };

    const submitFeedback = async () => {
        try {
            setUpdateAlert({message: '', severity: 'info'});
            setState(ProvideFeedbackState.SUBMITTING);
            logger.info(history);
            await createSupportTicket({
                description: description,
                summary: summary,
                url: `${window.location.origin}${history.location.pathname}${history.location.search}`,
                version: version,
                userAgent: window.navigator.userAgent
            });
            setUpdateAlert({message: 'Thank you, your feedback has been submitted.', severity: 'success'});
            setState(ProvideFeedbackState.SUBMITTED);
            clearResetTimeout();
            resetTimeout.current = setTimeout(() => {
                reset();
            }, 3000);
        } catch(e) {
            setState(ProvideFeedbackState.READY);
            setUpdateAlert({message: e.message, severity: 'error'});
        }
    };

    /**
     * Since the component is not unmounted and visibility is only changed we use this reset function
     * If it wasn't part of a modal it would be possible to use a useEffect to cleanup
     */
    const reset = () => {
        setState(ProvideFeedbackState.READY);
        setUpdateAlert({message: '', severity: 'info'});
        setDescription('');
        setSummary('');
        setShowFeedbackModal(false);
        setValidated(false);
        clearResetTimeout();
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
                Rederly Support
            </Button>

            <Modal
                show={showFeedbackModal}
                onHide={cancel}
                dialogClassName="modal-90w"
            >
                <Form noValidate validated={validated} onSubmit={submit}>
                    <fieldset disabled={state !== ProvideFeedbackState.READY}>
                        <Modal.Header closeButton>
                            <Modal.Title>
                            Provide Feedback to Rederly Support
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {state === ProvideFeedbackState.SUBMITTING && <Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner>}
                            {message && <MUIAlert severity={severity}>{message}</MUIAlert>}
                            <FormGroup controlId='provide-feedback-summary'>
                                <FormLabel>
                                Summary:
                                </FormLabel>
                                <FormControl
                                    required
                                    defaultValue=''
                                    size='lg'
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
                                    as="textarea"
                                    rows={3}
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
                    </fieldset>
                </Form>
            </Modal>
        </>
    );
};