import _ from 'lodash';
import React, { useState } from 'react';
import { Modal, ModalTitle, ModalBody, Form, Button, ModalFooter, FormGroup, FormControl, FormLabel, Alert } from 'react-bootstrap';
import ModalHeader from 'react-bootstrap/ModalHeader';
import AxiosRequest from '../../Hooks/AxiosRequest';
import useAlertState from '../../Hooks/useAlertState';
import { UserObject } from '../CourseInterfaces';

interface EmailModalProps {
    users: UserObject[];     // The number of users this message is going out to.
    show: boolean;
    setClose: () => void;
}

/**
 * This modal pops up with a form to email students.
 * The users that are emailed are chosen on another screen.
 */
export const EmailModal: React.FC<EmailModalProps> = ({users, show, setClose}) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [{message: sendEmailRespMsg, variant: sendEmailRespAlertType}, setSendEmailRespMsg] = useAlertState();

    const onSendEmail = async () => {
        try {
            const res = await AxiosRequest.post('/users/email', {subject, content: body, userIds: _.map(users, 'id')});
            const msg = res.data?.data?.msg || 'Success';
            setSendEmailRespMsg({message: msg, variant: 'success'});
        } catch (e) {
            const msg = e?.data?.data?.msg || 'An error occurred';
            setSendEmailRespMsg({message: msg, variant: 'danger'});
        }
    };

    return (
        <Modal show={show} onHide={setClose}>
            <ModalHeader closeButton>
                <ModalTitle>Email Students</ModalTitle>
            </ModalHeader>
            <ModalBody>
                <Form>
                    <Alert variant={sendEmailRespAlertType} show={sendEmailRespMsg.length > 0}>{sendEmailRespMsg}</Alert>
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
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button
                    variant="primary"
                    onClick={onSendEmail}
                    disabled={sendEmailRespAlertType === 'success'}
                >
                        Send Email</Button>
            </ModalFooter>
        </Modal>
    );
};

export default EmailModal;