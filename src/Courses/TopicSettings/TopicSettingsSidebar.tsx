import { Chip, Grid } from '@material-ui/core';
import _ from 'lodash';
import React from 'react';
import { Draggable, DragDropContext, Droppable, DraggableProvided } from 'react-beautiful-dnd';
import { Nav, NavLink } from 'react-bootstrap';
import { FaFileUpload } from 'react-icons/fa';
import { MdAdd, MdWarning } from 'react-icons/md';
import { GrDrag } from 'react-icons/gr';
import { TopicObject, CourseTopicAssessmentInfo, ProblemObject } from '../CourseInterfaces';
import { DropzoneInputProps } from 'react-dropzone';
import { useHistory, useRouteMatch } from 'react-router-dom';

import './TopicSettings.css';

interface TopicSettingsSidebarProps {
    topic: TopicObject | CourseTopicAssessmentInfo;
    selected: TopicObject | ProblemObject;
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    addNewProblem: () => void;
    handleDrag: (result: any) => Promise<void>;
    isDragActive: boolean;
    open: () => void;
    getInputProps: (props?: DropzoneInputProps | undefined) => DropzoneInputProps;
}

// This is a sidebar that shows the settings for a topic as a single list.
export const TopicSettingsSidebar: React.FC<TopicSettingsSidebarProps> = ({topic, selected, setSelected, addNewProblem, handleDrag, isDragActive, getInputProps, open}) => {
    const { url } = useRouteMatch();
    const history = useHistory();

    return (
        <Grid item md={3}>
            <form style={{position: 'relative'}}>
                {isDragActive && (
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        border: '5px dashed lightblue',
                        borderRadius: '3px',
                        textAlign: 'center',
                        zIndex: 2,
                        backgroundColor: 'white',
                        opacity: 0.9
                    }}>
                        <div style={{position: 'relative', margin: '0 auto', top: '30%', fontSize: '1.3em'}}>
                            Drop your DEF file to add problems to this topic!
                            <FaFileUpload style={{position: 'relative', margin: '0 auto', top: '30%', display: 'block', fontSize: '2em'}}/>
                        </div>
                    </div>
                )}
                <Nav
                    variant='pills'
                    className='flex-column'
                    defaultActiveKey={'topic'}
                    activeKey={(selected instanceof TopicObject) ? 'topic' : `${selected.id}`}
                >
                    {/* Settings for the entire topic */}
                    <NavLink
                        eventKey={'topic'}
                        onSelect={() => {
                            setSelected(topic);
                            history.push(`${url}`);
                        }}
                        role='link'
                        style={{}}
                    >
                        <h4>Topic Settings</h4>
                        {/* <Chip style={{float: 'right'}} label={`${topic.questions.reduce((accum, prob)=>!prob.optional ? accum += prob.weight : accum, 0)}/${topic.questions.reduce((accum, prob)=>accum += prob.weight, 0)} Points`}/> */}
                        <p>
                            Required Points: {topic.questions.reduce((accum, prob)=>!prob.optional ? accum += prob.weight : accum, 0)}&nbsp;
                            Total Points: {topic.questions.reduce((accum, prob)=>accum += prob.weight, 0)}
                        </p>
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
                                                                <div 
                                                                    ref={dragProvided.innerRef} 
                                                                    {...dragProvided.draggableProps} 
                                                                    {...dragProvided.dragHandleProps}
                                                                    style={prob.errors ? {backgroundColor: 'rgba(255, 0, 0, 0.2)'} : undefined}
                                                                >
                                                                    <NavLink
                                                                        eventKey={prob.id}
                                                                        key={`problemNavLink${prob.id}`}
                                                                        onSelect={() => {
                                                                            setSelected(prob);
                                                                            history.push(`${url}?problemId=${prob.id}`);
                                                                        }}
                                                                        role='link'
                                                                        style={{
                                                                            fontStyle: prob.optional ? 'italic' : undefined,
                                                                            cursor: 'grab',
                                                                        }}
                                                                    >
                                                                        <span 
                                                                            className='icon-container' 
                                                                            style={{cursor: 'pointer', color: prob.errors ? 'red' : 'inherit'}}
                                                                        >
                                                                            <GrDrag className='grDragHandle' style={{cursor: 'grab', marginRight: '0.7em'}} />
                                                                            { prob.errors && <MdWarning />}
                                                                            {`Problem ${prob.problemNumber} (${prob.weight} Point${prob.weight === 1 ? '' : 's'})`}
                                                                        </span>
                                                                        <Chip style={{float: 'right', cursor: 'pointer'}} size='small' label={prob.id} />
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
                        // as={Button}
                        onClick={addNewProblem}
                        className='additiveNave'
                    >
                        <span className='icon-container'><MdAdd style={{marginRight: '0.7em'}} /> Add Problem</span>
                    </NavLink>
                    <NavLink
                        // as={Button}
                        onClick={open}
                    >
                        <input {...getInputProps()}/>
                        <span className='icon-container' style={{color: 'black'}}><FaFileUpload style={{marginRight: '0.7em', color: 'black'}}/> Upload a DEF File</span>
                    </NavLink>
                </Nav>
            </form>
        </Grid>
    );
};

export default TopicSettingsSidebar;