import { FormControlLabel, Grid, Switch } from '@material-ui/core';
import React, { useState } from 'react';
import { CourseTopicAssessmentInfo, TopicObject, UnitObject } from '../CourseInterfaces';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import TopicSettingsSidebar from './TopicSettingsSidebar';
import { useCourseContext } from '../CourseProvider';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import SettingsForm from './SettingsForm';

interface TopicSettingsPageProps {

}

const renderTopicSettings = () => {
    return (
        <>
            <Grid item md={12}>
                <FormControlLabel value='Examination Type' label='right' labelPlacement='start' control={<Switch color='primary'/>} />
            </Grid>
        </>
    );
};


export const TopicSettingsPage: React.FC<TopicSettingsPageProps> = () => {
    const [selectedProblemId, setSelectedProblemId] = useState<number | 'topic'>('topic');

    const {course, setCourse, error} = useCourseContext();
    const { topicId: topicIdStr } = useParams<{topicId?: string}>();
    const topicId = topicIdStr && parseInt(topicIdStr, 10);

    let topic: TopicObject | undefined;
    for (let unit of course.units) {
        if (!topic) {
            console.log(unit.topics[0].id, topicId);
            topic = _.find(unit.topics, ['id', topicId]);
        } else {
            break;
        }
    }

    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <Grid container spacing={2}>
                {/* Sidebar */}
                <TopicSettingsSidebar 
                    topic={topic || new TopicObject()} 
                    selectedProblemId={selectedProblemId} 
                    setSelectedProblemId={setSelectedProblemId} 
                />
                {/* Problem List */}
                <SettingsForm />
            </Grid>
        </MuiPickersUtilsProvider>
    );
};

export default TopicSettingsPage;