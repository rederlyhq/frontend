import { Grid } from '@material-ui/core';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { CourseObject, UnitObject, UserObject, ProblemObject, SettingsComponentType, TopicObject } from '../Courses/CourseInterfaces';
import MultiSelectCardList from './MultiSelectCardList';

interface MaterialBiSelectProps {
    course: CourseObject;
    users: UserObject[];
    selected: {
        topic?: TopicObject, 
        problem?: ProblemObject, 
        user?: UserObject
    };
    setSelected: React.Dispatch<React.SetStateAction<{
        topic?: TopicObject;
        problem?: ProblemObject;
        user?: UserObject;
    }>>
}

export const MaterialBiSelect: React.FC<MaterialBiSelectProps> = ({course, users, selected, setSelected}) => {
    const onItemClick = (type: SettingsComponentType) => {
        if (type instanceof TopicObject) {
            setSelected(selected => ({topic: type, user: selected.user}));
        } else if (type instanceof ProblemObject) {
            setSelected(selected => ({topic: selected.topic, problem: type, user: selected.user}));
        } else if (type instanceof UserObject) {
            setSelected(selected => ({topic: selected.topic, problem: selected.problem, user: type}));
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

export default MaterialBiSelect;