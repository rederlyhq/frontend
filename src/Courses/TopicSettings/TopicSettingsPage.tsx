import { FormControlLabel, Grid, Switch } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { CourseTopicAssessmentInfo, ProblemObject, TopicObject, UnitObject } from '../CourseInterfaces';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider, DateTimePicker } from '@material-ui/pickers';
import TopicSettingsSidebar from './TopicSettingsSidebar';
import { useCourseContext } from '../CourseProvider';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import SettingsForm from './SettingsForm';
import { postQuestion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';

interface TopicSettingsPageProps {

}


export const TopicSettingsPage: React.FC<TopicSettingsPageProps> = () => {
    const [selectedProblemId, setSelectedProblemId] = useState<number | 'topic'>('topic');
    const [topic, setTopic] = useState<TopicObject | null>(null);
    
    const {course, setCourse, error} = useCourseContext();
    const { topicId: topicIdStr } = useParams<{topicId?: string}>();
    const topicId = topicIdStr ? parseInt(topicIdStr, 10) : null;
    
    useEffect(()=>{
        let topicObj;
        for (let unit of course.units) {
            if (!topic) {
                topicObj = _.find(unit.topics, ['id', topicId]);
            } else {
                break;
            }
        }

        setTopic(new TopicObject(topicObj));
    }, [topicId])

    const addNewProblem = async () => {
        if (_.isNil(topicId)) {
            console.error('Tried to add a new problem with no topicId');
            return;
        }

        const result = await postQuestion({
            data: {
                courseTopicContentId: topicId
            }
        });
    
        const newProb = new ProblemObject(result.data.data);
    }

    if (_.isNil(topicIdStr)) {
        return null;
    }
    
    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <Grid container spacing={5} style={{margin: '0rem 5rem 0rem 5rem'}}>
                {/* Sidebar */}
                <TopicSettingsSidebar 
                    topic={topic || new TopicObject()} 
                    selectedProblemId={selectedProblemId} 
                    setSelectedProblemId={setSelectedProblemId}
                    addNewProblem={addNewProblem}
                />
                {/* Problem List */}
                <SettingsForm 
                    selectedProblemId={selectedProblemId} 
                />
            </Grid>
        </MuiPickersUtilsProvider>
    );
};

export default TopicSettingsPage;