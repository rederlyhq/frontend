import React from 'react';
import { List, Card, ListItem, ListSubheader } from '@material-ui/core';
import { AnimatePresence, motion } from 'framer-motion';
import { ProblemObject, SettingsComponentType } from '../Courses/CourseInterfaces';

interface MultiSelectCardListProps {
    listItems: SettingsComponentType[];
    onItemClick: (type: SettingsComponentType) => void;
    title: string;
    selected?: SettingsComponentType;
}

const renderCard = (item: SettingsComponentType) => {
    if (item instanceof ProblemObject) {
        const pgPathArr = item.webworkQuestionPath.split('/');
        const pgPath = pgPathArr[pgPathArr.length-1];
        return (
            <span title={pgPath}>{`Problem ${item.problemNumber} (${item.id})`}</span>
        );
    }
    return item.name;
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
                                selected={selected && selected.id === item.id}
                                onClick={() => onItemClick(item)}
                                component={Card}
                                style={{margin: '1em', overflow: 'ellipses'}}
                            >
                                {renderCard(item)}
                            </ListItem>
                        </motion.div>
                    )))
                }
            </AnimatePresence>
        </List>
    );
};

export default MultiSelectCardList;