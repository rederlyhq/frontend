import React from 'react';
import { List, Card, ListItem, ListSubheader, Tooltip, ListItemIcon, Chip, ListItemText } from '@material-ui/core';
import { AnimatePresence, motion } from 'framer-motion';
import { ProblemObject, SettingsComponentType, TopicObject } from '../Courses/CourseInterfaces';
import _ from 'lodash';
import { getUserRole, UserRole } from '../Enums/UserRole';

interface MultiSelectCardListProps {
    listItems: SettingsComponentType[];
    onItemClick: (type: SettingsComponentType) => void;
    title: string;
    selected?: SettingsComponentType | null;
}

const RenderCard = ({item}: {item: SettingsComponentType}) => {
    if (item instanceof ProblemObject) {
        const pgPathArr = item.webworkQuestionPath.split('/');
        const pgPath = pgPathArr[pgPathArr.length-1];
        return (
            <ListItemText title={getUserRole() !== UserRole.STUDENT ? `${pgPath} (ID# ${item.id})}` : `ID# ${item.id}`}>
                {`Problem ${item.problemNumber} (${item.weight} Point${item.weight > 1 ? 's' : ''})`}
            </ListItemText>
        );
    } else if (item instanceof TopicObject) {
        return <ListItemText>Topic Grades</ListItemText>;
    }
    return <ListItemText>{item.name}</ListItemText>;
};

const variants = {
    visible: (custom: number) => ({
        opacity: 1,
        transition: { delay: custom * 0.2 }
    }),
    invisible: (custom: number) => ({
        opacity: 0,
        transition: { delay: custom * 0.2 }
    }),
};

export const MultiSelectCardList: React.FC<MultiSelectCardListProps> = ({listItems, onItemClick, title, selected}) => {
    return (
        <List>
            {/* Disable sticky until full height issue is resolved. */}
            <ListSubheader disableSticky><h3>{title}</h3></ListSubheader>
            <AnimatePresence>
                {
                    listItems.map(((item: SettingsComponentType, i: number) => (
                        <motion.div 
                            layoutTransition
                            initial={'invisible'}
                            animate='visible'
                            exit={'invisible'}
                            key={item.id}
                            custom={i}
                            variants={variants}
                        >
                            <ListItem
                                button
                                selected={item instanceof TopicObject ? _.isNil(selected) : selected?.id === item.id}
                                onClick={() => onItemClick(item)}
                                component={Card}
                                style={{margin: '1em', overflow: 'ellipses'}}
                            >
                                <RenderCard item={item} />
                                {!_.isNil(_.get(item, 'localGrade')) && <ListItemIcon>
                                    <Tooltip title='Grade'>
                                        <Chip label={_.get(item, 'localGrade')?.toPercentString()} color={item instanceof TopicObject ? 'primary' : undefined}/>
                                    </Tooltip>
                                </ListItemIcon>}
                            </ListItem>
                        </motion.div>
                    )))
                }
            </AnimatePresence>
        </List>
    );
};

export default MultiSelectCardList;