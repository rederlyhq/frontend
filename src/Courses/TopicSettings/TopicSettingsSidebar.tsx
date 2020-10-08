import { Chip, FormControlLabel, Grid, Switch, TextField } from '@material-ui/core';
import _ from 'lodash';
import React, { useState } from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Nav, NavLink } from 'react-bootstrap';
import { MdAdd, MdDragHandle } from 'react-icons/md';
import { TopicObject, CourseTopicAssessmentInfo } from '../CourseInterfaces';

import './TopicSettings.css';

interface TopicSettingsSidebarProps {
    topic: TopicObject | CourseTopicAssessmentInfo;
    selectedProblemId: number | 'topic';
    setSelectedProblemId: React.Dispatch<React.SetStateAction<number | 'topic'>>;
}

// This is a sidebar that shows the settings for a topic as a single list.
export const TopicSettingsSidebar: React.FC<TopicSettingsSidebarProps> = ({topic, selectedProblemId, setSelectedProblemId}) => {

    return (
        <Grid item md={3}>
            <form>
                <Nav variant='pills' className='flex-column' defaultActiveKey={selectedProblemId}>
                    {/* Settings for the entire topic */}
                    <NavLink
                        eventKey={'topic'}
                        onSelect={() => {setSelectedProblemId('topic');}}
                        role='link'
                        style={{}}
                    >
                        <h4>Topic Settings</h4>
                    </NavLink>

                    {/* List of Draggable problems, for reordering */}
                    <DragDropContext onDragEnd={()=>{}}>
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
                                                            {(provided) => (
                                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                    <NavLink 
                                                                        eventKey={prob.id} 
                                                                        key={`problemNavLink${prob.id}`} 
                                                                        onSelect={() => {setSelectedProblemId(prob.id);}}
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
                                    </div>)}
                        </Droppable>
                    </DragDropContext>

                    {/* Unselectable button for adding new problems */}
                    <NavLink
                        onClick={()=>{}}
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