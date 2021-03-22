import React, { useState } from 'react';
import { postEmailProfessor } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { ProblemObject, TopicObject } from '../Courses/CourseInterfaces';
import { useCourseContext } from '../Courses/CourseProvider';
import { Alert, Button as BSButton, Form, FormControl, FormGroup, FormLabel, Modal, ModalBody, ModalFooter, ModalTitle } from 'react-bootstrap';
import { Button } from '@material-ui/core';
import ModalHeader from 'react-bootstrap/ModalHeader';
import useAlertState from '../Hooks/useAlertState';
import logger from '../Utilities/Logger';

interface EmailProfessorProps {
    topic: TopicObject;
    problem: ProblemObject;
}

/**
 * This is a button-and-model pair.
 */
export const EmailProfessor: React.FC<EmailProfessorProps> = ({problem}) => {
    const {course} = useCourseContext();
    const [content, setContent] = useState<string>('');
    const [show, setShow] = useState<boolean>(false);
    const [{message: sendEmailRespMsg, variant: sendEmailRespAlertType}, setSendEmailRespMsg] = useAlertState();
    const [disabled, setDisabled] = useState<boolean>(true);

    const onClick = async () => {
        setDisabled(true);
        if (content === '') {
            setSendEmailRespMsg({message: 'Email content cannot be empty.', variant: 'danger'});
            return;
        }

        try {
            const res = await postEmailProfessor({
                courseId: course.id,
                content: content,
                question: {
                    id: problem.id,
                }
            });
            setSendEmailRespMsg({message: res.data.message ?? 'Email sent.', variant: 'success'});
        } catch (e) {
            logger.error('A student failed to email their professor.', e.message);
            setSendEmailRespMsg({message: e.message, variant: 'danger'});
            setDisabled(false);
        }
    };

    return (
        <>
            <Button 
                variant='contained'
                color='primary'
                onClick={()=>{setSendEmailRespMsg({message: '', variant: 'warning'}); setShow(true);}}
                style={{marginLeft: '1em'}} 
            >
                Email Professor
            </Button>
            <Modal show={show} onHide={()=>setShow(false)}>
                <ModalHeader closeButton>
                    <ModalTitle>Email Your Professor</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <Form>
                        <Alert variant={sendEmailRespAlertType} show={Boolean(sendEmailRespMsg)}>{sendEmailRespMsg}</Alert>
                        <FormGroup>
                            <FormLabel>Compose your email below:</FormLabel>
                            <FormControl 
                                as='textarea' 
                                size='sm' style={{height: '200px'}}
                                autoComplete='off'
                                value={content}
                                onChange={(e: any) => {
                                    setContent(e.target.value);
                                    if (disabled && e.target.value !== '') {
                                        setDisabled(false);
                                        setSendEmailRespMsg({message: '', variant: 'warning'});
                                    }
                                }}
                            />
                        </FormGroup>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button 
                        variant='contained'
                        color="primary" 
                        onClick={onClick}
                        disabled={disabled}
                    >
                        Send Email</Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default EmailProfessor;