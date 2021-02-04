import React, { useState, useEffect } from 'react';
import { TopicObject, CourseObject } from '../CourseInterfaces';
import AxiosRequest from '../../Hooks/AxiosRequest';
import TopicsList from './TopicsTab/TopicsList';
import _ from 'lodash';
import moment from 'moment';
import { UserRole, getUserRole, getUserId } from '../../Enums/UserRole';

interface ActiveTopicsProps {
    course: CourseObject
}

export const ActiveTopics: React.FC<ActiveTopicsProps> = ({course}) => {
    const userType: UserRole = getUserRole();
    const userId: number = getUserId();

    const activeTopics = course.units.reduce<Array<TopicObject>>((accum, unit) => {
        const topicsArr = unit.topics.filter((topic) => {
            return  moment().isBetween(topic.startDate, topic.deadDate, 'day', '[]') || 
                    topic.getActiveExtensions(userType === UserRole.STUDENT ? userId : undefined).length > 0;
        });
        return [...accum, ...topicsArr];
    }, []);

    return (
        <TopicsList 
            listOfTopics={activeTopics}
        />
    );
};

export default ActiveTopics;