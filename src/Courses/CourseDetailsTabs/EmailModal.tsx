import _ from 'lodash';
import React, { useState } from 'react';
import { Modal, ModalTitle, ModalBody, Form, Button, ModalFooter, FormGroup, FormControl, FormLabel, Alert, Spinner } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/ModalHeader';
import AxiosRequest from '../../Hooks/AxiosRequest';
import useAlertState from '../../Hooks/useAlertState';
import { UserObject } from '../CourseInterfaces';

interface EmailModalProps {
    users: UserObject[];     // The number of users this message is going out to.
    show: boolean;
    setClose: () => void;
}

enum EmailModalState {
    READY='READY',
    SENDING='SENDING',
    COMPLETE='COMPLETE'
}
/**
 * This modal pops up with a form to email students.
 * The users that are emailed are chosen on another screen.
 */
export const EmailModal: React.FC<EmailModalProps> = ({users, show, setClose: setCloseProp}) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [{message: sendEmailRespMsg, variant: sendEmailRespAlertType}, setSendEmailRespMsg] = useAlertState();
    const [modalState, setModalState] = useState(EmailModalState.READY);

    const onSendEmail = async () => {
        try {
            setModalState(EmailModalState.SENDING);
            const res = await AxiosRequest.post('/users/email', {subject, content: body, userIds: _.map(users, 'id')});
            const msg = res.data?.data?.msg || 'Success';
            setSendEmailRespMsg({message: msg, variant: 'success'});
            setModalState(EmailModalState.COMPLETE);
        } catch (e) {
            const msg = e?.data?.data?.msg || 'An error occurred';
            setSendEmailRespMsg({message: msg, variant: 'danger'});
            setModalState(EmailModalState.READY);
        }
    };

    const setClose = () => {
        setCloseProp();
        setSubject('');
        setBody('');
        setSendEmailRespMsg({
            message: '',
            variant: 'info'
        });
        setModalState(EmailModalState.READY);
    };

    return (
        <Modal show={show} onHide={setClose}>
            <ModalHeader closeButton>
                <ModalTitle>Email Students</ModalTitle>
            </ModalHeader>
            <Form>
                <fieldset disabled={modalState !== EmailModalState.READY}>
                    <ModalBody>
                        {modalState === EmailModalState.SENDING &&
                            <div
                                style={{
                                    display: 'flex',
                                    width:'100%',
                                    padding: '10px',
                                }}
                            >
                                <Spinner animation='border' role='status' style={{margin:'auto'}}><span className='sr-only'>Loading...</span></Spinner>
                            </div>
                        }
                        <Alert variant={sendEmailRespAlertType} show={Boolean(sendEmailRespMsg)}>{sendEmailRespMsg}</Alert>
                        <div>You are sending an email to {users.length} students.</div>
                        <FormGroup controlId='Subject'>
                            <FormLabel>Subject: </FormLabel>
                            <FormControl
                                type='text'
                                autoComplete='off'
                                onChange={(e: any) => setSubject(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>Message Content:</FormLabel>
                            <FormControl
                                as='textarea'
                                size='sm' style={{height: '200px'}}
                                autoComplete='off'
                                onChange={(e: any) => setBody(e.target.value)}
                            />
                        </FormGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="primary"
                            onClick={onSendEmail}
                        >
                                Send Email</Button>
                    </ModalFooter>
                </fieldset>
            </Form>
        </Modal>
    );
};

export default EmailModal;