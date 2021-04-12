import React from 'react';
import _ from 'lodash';
import { Button, Grid } from '@material-ui/core';
import EmailProfessor from './EmailProfessor';
import { TopicObject, ProblemObject, CourseObject } from '../Courses/CourseInterfaces';
import moment from 'moment';
import CollapsibleQuillReadOnlyDisplay from '../Components/Quill/CollapsibleQuillReadonlyDisplay';

interface SimpleProblemButtonRowProps {
    setOpenDrawer: React.Dispatch<boolean>;
    topic: TopicObject;
    problem: ProblemObject;
    course: CourseObject;
    smaHasNoVersions: boolean;
    clickedAskForHelp: (problemId: number)=>Promise<void>;
    requestShowMeAnother: (problemId: number)=>Promise<void>;
}

export const SimpleProblemButtonRow: React.FC<SimpleProblemButtonRowProps> = ({setOpenDrawer, topic, problem, course, smaHasNoVersions, clickedAskForHelp, requestShowMeAnother}) => {
    return <CollapsibleQuillReadOnlyDisplay 
        showQuill={(topic.description && !_.isEmpty(topic.description))}
        content={typeof topic.description === 'string' ? JSON.parse(topic.description) : topic.description} 
        infoTitle='Expand description'    
    >
        {/* <Grid alignContent='flex-end'> */}
        <Grid item xs={6} md='auto'>
            <Button
                variant='contained'
                color='primary'
                onClick={()=>setOpenDrawer(true)}
                disabled={_.isNil(setOpenDrawer)}
                title={_.isNil(setOpenDrawer) ? 'You must be enrolled in this course to upload attachments.' : 'Click here to open the Attachments sidebar.'}
            >
                Attach Work
            </Button>
        </Grid>
        <Grid item xs={6} md='auto'><EmailProfessor topic={topic} problem={problem} /></Grid>
        {topic.topicTypeId !== 2 && 
                (problem.smaEnabled && (problem.grades?.first?.overallBestScore === 1 || topic.deadDate.toMoment().isBefore(moment()))) &&
                <Grid item xs={6} md='auto'>
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={()=>requestShowMeAnother(problem.id)}
                        disabled={smaHasNoVersions}
                    >
                        Show Me Another
                    </Button>
                </Grid>
        }
        {course.canAskForHelp && topic.topicTypeId !== 2 &&
            <Grid item xs={6} md='auto'>
                <Button 
                    variant='contained'
                    color='primary'
                    onClick={()=>clickedAskForHelp(problem.id)}
                >
                    Ask for help
                </Button>
            </Grid>
        }
        {/* </Grid> */}
    </CollapsibleQuillReadOnlyDisplay>;
};
