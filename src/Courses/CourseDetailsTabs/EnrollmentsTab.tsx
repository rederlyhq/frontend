import React, { useEffect, useState, useRef } from 'react';
import { UserObject } from '../CourseInterfaces';
import EmailComponentWrapper from './EmailComponentWrapper';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { Row, FormLabel, InputGroup, FormControl, Button, Col } from 'react-bootstrap';
import { UserRole, getUserRole } from '../../Enums/UserRole';
import { useCourseContext } from '../CourseProvider';

interface EnrollmentsTabProps {
}

export const EnrollmentsTab: React.FC<EnrollmentsTabProps> = () => {
    const {course, users} = useCourseContext();
    const courseCode = course.code;
    // I don't understand why I need two encodeURIComponent here
    // I want one to be in the enroll user page (since the params decodes it anyway, but it needs to be encoded so it can be decoded by express)
    // The only thing I can think of is that useParams is decoding as a uri and not a uri component, however using just uri breaks it (and I can see it's not encoded correctly)
    const enrollUrl = `${window.location.host}/common/courses/enroll/${encodeURIComponent(encodeURIComponent(courseCode))}`;
    const userType: UserRole = getUserRole();

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

    return (
        <>
            <Row>
                <Col md={10}>
                    <h2>Current Enrollments</h2>
                </Col>
            </Row>
            {userType !== UserRole.STUDENT && (
                <>
                    <FormLabel>Enrollment Link:</FormLabel>
                    <InputGroup className="mb-3">
                        <FormControl
                            readOnly
                            aria-label="Enrollment link"
                            aria-describedby="basic-addon2"
                            ref={textAreaRef}
                            value={`https://${enrollUrl}`}
                        />
                        <InputGroup.Append>
                            <Button variant="outline-secondary" onClick={copyToClipboard}>Copy to Clipboard</Button>
                        </InputGroup.Append>
                    </InputGroup>
                </>
            )}

            <EmailComponentWrapper users={users} />
        </>
    );
};

export default EnrollmentsTab;