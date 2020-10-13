import { Chip, FormControlLabel, Grid, Switch, TextField } from '@material-ui/core';
import _ from 'lodash';
import React, { useState } from 'react';
import { Draggable, DragDropContext, Droppable, DraggableProvided } from 'react-beautiful-dnd';
import { Nav, NavLink } from 'react-bootstrap';
import { MdAdd, MdDragHandle } from 'react-icons/md';
import { TopicObject, CourseTopicAssessmentInfo, ProblemObject } from '../CourseInterfaces';

import './TopicSettings.css';

interface TopicSettingsSidebarProps {
    topic: TopicObject | CourseTopicAssessmentInfo;
    selected: TopicObject | ProblemObject;
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    addNewProblem: () => void;
    handleDrag: (result: any) => Promise<void>;
}

// This is a sidebar that shows the settings for a topic as a single list.
export const TopicSettingsSidebar: React.FC<TopicSettingsSidebarProps> = ({topic, selected, setSelected, addNewProblem, handleDrag}) => {

    return (
        <Grid item md={3}>
            <form>
                <Nav variant='pills' className='flex-column' defaultActiveKey={(selected instanceof TopicObject) ? 'topic' : `${selected.id}`}>
                    {/* Settings for the entire topic */}
                    <NavLink
                        eventKey={'topic'}
                        onSelect={() => {setSelected(topic);}}
                        role='link'
                        style={{}}
                    >
                        <h4>Topic Settings</h4>
                    </NavLink>

                    {/* List of Draggable problems, for reordering */}
                    <DragDropContext onDragEnd={handleDrag}>
                        <Droppable droppableId='problemsList'>
                            {
                                (provided) => (
                                    <div ref={provided.innerRef} style={{ backgroundColor: 'white' }} {...provided.droppableProps}>
                                        {
                                            _.chain(topic.questions)
                                                .sortBy(['problemNumber'])
                                                .map((prob, index) => {
                                                    return (
                                                        <Draggable draggableId={`problemRow${prob.id}`} index={index} key={`problem-row-${prob.id}`}>
                                                            {(dragProvided: DraggableProvided) => (
                                                                <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                                                                    <NavLink 
                                                                        eventKey={prob.id} 
                                                                        key={`problemNavLink${prob.id}`} 
                                                                        onSelect={() => {setSelected(prob);}}
                                                                        role='link'
                                                                        style={{
                                                                            fontStyle: prob.optional ? 'italic' : undefined
                                                                        }}
                                                                    >
                                                                        <span className='icon-container'>
                                                                            <MdDragHandle /> 
                                                                            {`Problem ${prob.problemNumber} (${prob.weight} Point${prob.weight === 1 ? '' : 's'})`}
                                                                        </span>
                                                                        <Chip style={{float: 'right'}} size='small' label={prob.id} />
                                                                    </NavLink>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })
                                                .value()
                                        }
                                        {provided.placeholder}
                                    </div>)}
                        </Droppable>
                    </DragDropContext>

                    {/* Unselectable button for adding new problems */}
                    <NavLink
                        onClick={addNewProblem}
                        className='additiveNave'
                    >
                        <span className='icon-container'><MdAdd /> Add Problem</span>
                    </NavLink>
                </Nav>
            </form>
        </Grid>
    );
};

export default TopicSettingsSidebar;