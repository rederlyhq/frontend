import { Grid } from '@material-ui/core';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { CourseObject, UnitObject, UserObject, ProblemObject, SettingsComponentType, TopicObject } from '../Courses/CourseInterfaces';
import MultiSelectCardList from './MultiSelectCardList';
import useQuerystringHelper, { QueryStringMode } from '../Hooks/useQuerystringHelper';

interface MaterialTriSelectProps {
    course: CourseObject;
    users: UserObject[];
    selected: {
        unit?: UnitObject, 
        topic?: TopicObject, 
        problem?: ProblemObject, 
        user?: UserObject
    };
    setSelected: React.Dispatch<React.SetStateAction<{
        unit?: UnitObject;
        topic?: TopicObject;
        problem?: ProblemObject;
        user?: UserObject;
    }>>
}

export const MaterialTriSelect: React.FC<MaterialTriSelectProps> = ({course, users, selected, setSelected}) => {
    const {updateRoute} = useQuerystringHelper();
    const onItemClick = (type: SettingsComponentType) => {
        let routeKey = '';

        if (type instanceof UnitObject) {
            setSelected(selected => ({unit: type, user: selected.user}));
            routeKey = 'unitId';
        } else if (type instanceof TopicObject) {
            setSelected(selected => ({unit: selected.unit, topic: type, user: selected.user}));
            routeKey = 'topicId';
        } else if (type instanceof ProblemObject) {
            setSelected(selected => ({unit: selected.unit, topic: selected.topic, problem: type, user: selected.user}));
            routeKey = 'problemId';
        } else if (type instanceof UserObject) {
            setSelected(selected => ({unit: selected.unit, topic: selected.topic, problem: selected.problem, user: type}));
            routeKey = 'userId';
        }
        
        updateRoute({[routeKey]: {
            mode: QueryStringMode.OVERWRITE,
            val: type.id.toString(),
        }}, true);
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
                {selected.topic !== undefined && selected.topic.topicTypeId !== 2 && <Grid item md={3}>
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