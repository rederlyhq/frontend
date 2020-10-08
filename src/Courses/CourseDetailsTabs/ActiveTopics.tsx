import React, { useState, useEffect } from 'react';
import { NewCourseTopicObj, CourseObject } from '../CourseInterfaces';
import AxiosRequest from '../../Hooks/AxiosRequest';
import TopicsList from '../TopicsList';
import _ from 'lodash';
import moment from 'moment';
import { UserRole, getUserRole, getUserId } from '../../Enums/UserRole';

interface ActiveTopicsProps {
    course: CourseObject
}

export const ActiveTopics: React.FC<ActiveTopicsProps> = ({course}) => {
    const [activeTopics, setActiveTopics] = useState<Array<NewCourseTopicObj>>([]);
    const userType: UserRole = getUserRole();
    const userId: number = getUserId();

    useEffect(()=>{
        (async () => {
            const res = await AxiosRequest.get(`/courses/topics?isOpen=true&courseId=${course.id}`);
            console.log(res.data.data);
            let activeTopics = res.data?.data?.map((topic: any) => new NewCourseTopicObj(topic));

            // TODO: Currently, the backend returns topics that have extensions for any users.
            // This filters out those topics and hides them.
            if (userType === UserRole.STUDENT) {
                activeTopics = activeTopics.filter((topic: NewCourseTopicObj) => {
                    // If this actually is an active topic, keep it.
                    if (moment().isBetween(topic.startDate, topic.deadDate, 'day', '[]')) {
                        return true;
                    } else {
                        return _.find(topic.studentTopicOverride, ['userId', userId]) !== undefined;
                    }
                }).map((topic: NewCourseTopicObj) => {
                    const override = _.find(topic.studentTopicOverride, ['userId', userId]);
                    if (!_.isNil(override)) {
                        delete override.id;
                        _.assign(topic, override);
                    }
                    return topic;
                });
            }

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