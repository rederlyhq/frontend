import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row } from 'react-bootstrap';
import { ICourseTemplate, CourseObject } from '../CourseInterfaces';
import _ from 'lodash';
import { CourseDetailsForm } from './CourseDetailsForm';
import './Course.css';
import moment from 'moment';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { useHistory } from 'react-router-dom';
import { postCourse } from '../../APIInterfaces/BackendAPI/Requests/Courses';

interface CreateCourseModalProps {
    courseTemplate: ICourseTemplate | null;
    onHide?: (() => void);
    show?: boolean;
}

export const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ courseTemplate, onHide, show }) => {
    const [course, setCourse] = useState<CourseObject>(new CourseObject());
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined | null>();
    const history = useHistory();

    const updateCourseValue = (field: keyof CourseObject, value: any) => {
        setCourse({...course, [field]: value});
    };

    const dismiss = () => {
        setCourse(new CourseObject());
        onHide?.();
    };

    const createCourse = async (course: CourseObject) => {
        return postCourse({
            useCurriculum: true,
            data: CourseObject.toAPIObject(course)
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError(null);
        try {
            setSaving(true);
            const result = await createCourse(course);
            history.push(`/common/courses/${result.data.data.id}`);
        } catch (e) {
            setError(e.message);
        }
        setSaving(false);
    };

    return (
        <>
            <Modal
                backdrop="static"
                show={show && !_.isNil(courseTemplate)}
                onHide={dismiss}
                dialogClassName="modal-90w"
                onShow={() => {
                    setCourse(new CourseObject({
                        curriculumId: courseTemplate?.id,
                        name: courseTemplate?.name,
                        start: moment().toDate(),
                        end: moment().add(4, 'M').toDate(),
                        semesterCodeYear: parseInt(moment().format('YYYY')),
                        textbooks: courseTemplate?.comment
                    }));
                }}
            >
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <h1>New Course</h1>
                    </Modal.Header>
                    <Modal.Body>
                        {saving && <Row style= {{display: 'flex', justifyContent: 'center', padding: '15px' }}><Spinner animation='border' role='status'><span className='sr-only'>Loading...</span></Spinner></Row>}
                        {!_.isNil(error) && <Alert variant="danger">{error}</Alert>}
                        <CourseDetailsForm course={course} updateCourseValue={updateCourseValue} disabled={saving} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={dismiss}>
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
