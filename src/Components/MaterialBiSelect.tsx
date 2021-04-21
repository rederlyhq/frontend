import { Grid } from '@material-ui/core';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { UserObject, ProblemObject, SettingsComponentType, StudentWorkbookInterface } from '../Courses/CourseInterfaces';
import MultiSelectCardList from './MultiSelectCardList';

interface MaterialBiSelectProps {
    problems: ProblemObject[];
    users: UserObject[];
    selected: {
        problem?: ProblemObject,
        user?: UserObject,
        workbook?: StudentWorkbookInterface,
    };
    setSelected: React.Dispatch<React.SetStateAction<{
        problem?: ProblemObject,
        user?: UserObject,
        workbook?: StudentWorkbookInterface,
    }>>
}

export const MaterialBiSelect: React.FC<MaterialBiSelectProps> = ({problems, users, selected, setSelected}) => {
    const onItemClick = (type: SettingsComponentType) => {
        if (type instanceof ProblemObject) {
            setSelected(selected => ({user: selected.user, problem: type}));
        } else if (type instanceof UserObject) {
            setSelected(selected => ({problem: selected.problem, user: type}));
        }
    };

    return (
        <Grid container spacing={1} wrap="nowrap">
            <AnimatePresence>
                {<Grid item md={users.length > 0 ? 6 : 12}>
                    <motion.div
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0}}
                    >
                        <MultiSelectCardList 
                            title='Problems'
                            listItems={problems} 
                            onItemClick={onItemClick}
                            selected={selected.problem}
                        />
                    </motion.div>
                </Grid>}
            </AnimatePresence>
            {users.length > 0 && <AnimatePresence>
                <Grid item md={6}>
                    <MultiSelectCardList 
                        title='Users'
                        listItems={users} 
                        onItemClick={onItemClick}
                        selected={selected.user}
                    />
                </Grid>
            </AnimatePresence>}
        </Grid>
    );
};

export default MaterialBiSelect;