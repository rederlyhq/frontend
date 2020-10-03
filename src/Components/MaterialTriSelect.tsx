import { Grid } from '@material-ui/core';
import { AnimatePresence, motion } from 'framer-motion';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { CourseObject, UnitObject, UserObject, NewCourseTopicObj, ProblemObject, SettingsComponentType } from '../Courses/CourseInterfaces';
import MultiSelectCardList from './MultiSelectCardList';

interface MaterialTriSelectProps {
    course: CourseObject;
    users: UserObject[];
    selected: {
        unit?: UnitObject, 
        topic?: NewCourseTopicObj, 
        problem?: ProblemObject, 
        user?: UserObject
    };
    setSelected: React.Dispatch<React.SetStateAction<{
        unit?: UnitObject;
        topic?: NewCourseTopicObj;
        problem?: ProblemObject;
        user?: UserObject;
    }>>
}

export const MaterialTriSelect: React.FC<MaterialTriSelectProps> = ({course, users, selected, setSelected}) => {
    const onItemClick = (type: SettingsComponentType) => {
        if (type instanceof UnitObject) {
            setSelected(selected => ({unit: type, user: selected.user}));
        } else if (type instanceof NewCourseTopicObj) {
            setSelected(selected => ({unit: selected.unit, topic: type, user: selected.user}));
        } else if (type instanceof ProblemObject) {
            setSelected(selected => ({unit: selected.unit, topic: selected.topic, problem: type, user: selected.user}));
        } else if (type instanceof UserObject) {
            setSelected(selected => ({unit: selected.unit, topic: selected.topic, problem: selected.problem, user: type}));
        }
    };

    return (
        <Grid container justify="center" spacing={3} wrap="nowrap">
            <Grid item md={3}>
                <MultiSelectCardList 
                    title='Units'
                    listItems={course.units} 
                    onItemClick={onItemClick}
                    selected={selected.unit}
                />
            </Grid>
            <AnimatePresence>
                {selected.unit !== undefined && <Grid item md={3}>
                    <motion.div
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0}}
                    >
                        <MultiSelectCardList 
                            title='Topics'
                            listItems={selected.unit.topics} 
                            onItemClick={onItemClick}
                            selected={selected.topic}
                        />
                    </motion.div>
                </Grid>}
            </AnimatePresence>
            <AnimatePresence>
                {selected.topic !== undefined && <Grid item md={3}>
                    <motion.div
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0}}
                    >
                        <MultiSelectCardList 
                            title='Problems'
                            listItems={selected.topic.questions} 
                            onItemClick={onItemClick}
                            selected={selected.problem}
                        />
                    </motion.div>
                </Grid>}
            </AnimatePresence>
            <Grid item md={3}>
                <MultiSelectCardList 
                    title='Users'
                    listItems={users} 
                    onItemClick={onItemClick}
                    selected={selected.user}
                />
            </Grid>
        </Grid>
    );
};

export default MaterialTriSelect;