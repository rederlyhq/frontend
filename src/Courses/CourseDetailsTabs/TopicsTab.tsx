import React, { useState, useEffect } from 'react';
import TopicsList from '../TopicsList';
import { Accordion, Card, Row, Col, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import AxiosRequest from '../../Hooks/AxiosRequest';

interface TopicsTabProps {

}

export const TopicsTab: React.FC<TopicsTabProps> = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<any>(null);

    useEffect(() => {
        (async ()=>{
            let course = await AxiosRequest.get(`/curriculum/${courseId}`);

            console.log(course.data.data);
            setCourse(course.data.data);
        })();
    }, []);

    return (
        <>
            <div>TODO: Refactor CourseEditPage into reusable+editable CourseDetails renderer.</div>
        </>
    );
};

export default TopicsTab;