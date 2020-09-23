import { Grid } from '@material-ui/core';
import React, { useState } from 'react';
import { CourseObject, UnitObject } from '../Courses/CourseInterfaces';
import MultiSelectCardList from './MultiSelectCardList';

interface MaterialTriSelectProps {
    course: CourseObject;
}

export const MaterialTriSelect: React.FC<MaterialTriSelectProps> = ({course}) => {
    const [courseWithSelection, setCourseWithSelection] = useState<CourseObject>(course);

    return (
        <Grid container justify="center" spacing={3} wrap="nowrap">
            <Grid item md={3}>
                <MultiSelectCardList 
                    title='Units'
                    listItems={course.units} 
                    onItemClick={()=>{}}    
                />
            </Grid>
            <Grid item md={3}>
                <MultiSelectCardList 
                    title='Topics'
                    listItems={[new UnitObject({id: 1, name: 'Topic 1'}), new UnitObject({id: 2, name: 'Topic 2'})]} 
                    onItemClick={()=>{}}    
                />
            </Grid>
            <Grid item md={3}>
                <MultiSelectCardList 
                    title='Problems'
                    listItems={[new UnitObject({id: 1, name: 'Problem 1'}), new UnitObject({id: 2, name: 'Problem 2'})]} 
                    onItemClick={()=>{}}    
                />
            </Grid>
            <Grid item md={3}>
                <MultiSelectCardList 
                    title='Users'
                    listItems={[new UnitObject({id: 1, name: 'User 1'}), new UnitObject({id: 2, name: 'User 2'})]} 
                    onItemClick={()=>{}}    
                />
            </Grid>
        </Grid>
    );
};

export default MaterialTriSelect;