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
    return <>
        {/* This is a workaround until we update this component to use the centralized Topic object. */}
        <CollapsibleQuillReadOnlyDisplay 
            showQuill={(topic?.description && !_.isEmpty(topic.description))}
            content={typeof topic.description === 'string' ? JSON.parse(topic.description) : topic.description} 
            infoTitle='Expand description'    
        >
            {/* <Grid alignContent='flex-end'> */}
            <Button
                variant='contained'
                color='primary'
                onClick={()=>setOpenDrawer(true)}
                disabled={_.isNil(setOpenDrawer)}
                title={_.isNil(setOpenDrawer) ? 'You must be enrolled in this course to upload attachments.' : 'Click here to open the Attachments sidebar.'}
                style={{marginLeft: '1em'}} 
            >
                    Attach Work
            </Button>
            <EmailProfessor topic={topic} problem={problem} />
            {topic.topicTypeId !== 2 && 
                    (problem.smaEnabled && (problem.grades?.first?.overallBestScore === 1 || topic.deadDate.toMoment().isBefore(moment()))) &&
                    <Button
                        variant='contained'
                        color='primary'
                        onClick={()=>requestShowMeAnother(problem.id)}
                        disabled={smaHasNoVersions}
                        style={{marginLeft: '1em'}} 
                    >
                        Show Me Another
                    </Button>
            }
            {course.canAskForHelp && topic.topicTypeId !== 2 &&
                <Button 
                    variant='contained'
                    color='primary'
                    onClick={()=>clickedAskForHelp(problem.id)}
                    style={{marginLeft: '1em'}} 
                >
                    Ask for help
                </Button>
            }
            {/* </Grid> */}
        </CollapsibleQuillReadOnlyDisplay>
    </>;
};
