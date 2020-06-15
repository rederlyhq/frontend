import React, { useEffect, useState, useRef } from 'react';
import { UserObject } from '../CourseInterfaces';
import EmailComponentWrapper from './EmailComponentWrapper';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { Row, FormLabel, InputGroup, FormControl, Button, Col } from 'react-bootstrap';

interface EnrollmentsTabProps {
    courseId: number;
    courseCode: string;
}

export const EnrollmentsTab: React.FC<EnrollmentsTabProps> = ({ courseId, courseCode }) => {
    const [users, setUsers] = useState<Array<UserObject>>([]);
    const enrollUrl = `${window.location.host}/common/courses/enroll/${courseCode}`;

    const textAreaRef = useRef<FormControl<'input'> & HTMLInputElement>(null);

    const copyToClipboard = (e: any) => {
        if (textAreaRef?.current === null) {
            console.error('enrollLinkRef not logged properly.');
            return;
        }
        console.log(textAreaRef);
        textAreaRef?.current.select();

        try {
            const res = document.execCommand('copy');
            console.log(`Copy operation ${res ? 'was successful' : 'failed'}`);
        } catch (err) {
            console.error(err);
        } finally {
            e.target.focus();
        }

    };
    useEffect(() => {
        (async () => {
            const usersResp = await AxiosRequest.get(`/users?courseId=${courseId}`);
            console.log(usersResp.data);
            setUsers(usersResp.data.data);
        })();
    }, [courseId]);

    return (
        <>
            <Row>
                <Col md={10}>
                    <h2>Current Enrollments</h2>
                </Col>
            </Row>
            <FormLabel>Enrollment Link:</FormLabel>
            <InputGroup className="mb-3">
                <FormControl
                    readOnly
                    aria-label="Enrollment link"
                    aria-describedby="basic-addon2"
                    ref={textAreaRef}
                    value={`http://${enrollUrl}`}
                />
                <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={copyToClipboard}>Copy to Clipboard</Button>
                </InputGroup.Append>
            </InputGroup>

            <EmailComponentWrapper users={users} />
        </>
    );
};

export default EnrollmentsTab;