import React, { useState, useEffect } from 'react';
import { NewCourseTopicObj, CourseObject } from '../CourseInterfaces';
import AxiosRequest from '../../Hooks/AxiosRequest';
import TopicsList from '../TopicsList';

interface ActiveTopicsProps {
    course: CourseObject
}

export const ActiveTopics: React.FC<ActiveTopicsProps> = ({course}) => {
    const [activeTopics, setActiveTopics] = useState<Array<NewCourseTopicObj>>([]);

    useEffect(()=>{
        (async () => {
            const res = await AxiosRequest.get(`/courses/topics?isOpen=true&courseId=${course.id}`);
            console.log(res.data.data);
            const activeTopics = res.data?.data?.map((topic: any) => new NewCourseTopicObj(topic));
            setActiveTopics(activeTopics);
        })();
    }, [course.id]);

    return (
        <TopicsList 
            listOfTopics={activeTopics}
        />
    );
};

export default ActiveTopics;