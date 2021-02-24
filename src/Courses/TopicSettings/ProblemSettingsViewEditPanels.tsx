import React, { useState } from 'react';
import { AppBar, Tab, Tabs } from '@material-ui/core';
import { TabPanel, TabContext, TabList } from '@material-ui/lab';
import SwipeableViews from 'react-swipeable-views';
import ProblemSettings from './ProblemSettings';
import { ProblemObject, TopicObject } from '../CourseInterfaces';
import RendererPreview from './RendererPreview';
import _ from 'lodash';

interface ProblemSettingsProps {
    selected: ProblemObject;
    // Used to reset the selected bar after a deletion occurs.
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
}

function a11yProps(index: any) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

enum ProblemSettingsTabs {
    VIEW_PROBLEM = 0,
    EDIT_PROBLEM = 1,
}

export const ProblemSettingsViewEditPanels: React.FC<ProblemSettingsProps> = (props) => {
    const [value, setValue] = useState<ProblemSettingsTabs>(ProblemSettingsTabs.VIEW_PROBLEM);
  
    const handleChange = (event: React.ChangeEvent<{}>, newValue: ProblemSettingsTabs) => {
        setValue(newValue);
    };
  
    return <div style={{width: '100%'}}>
        <TabContext value={value.toString()}>
            <AppBar position="static" color="default">
                <Tabs
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    aria-label="problem settings edit/view tabs"
                    variant='fullWidth'
                    centered
                    value={value}
                >
                    <Tab label='View' {...a11yProps(0)} />
                    <Tab label='Settings' {...a11yProps(1)} />
                </Tabs >
            </AppBar>
            <TabPanel value={ProblemSettingsTabs.EDIT_PROBLEM.toString()}>
                <ProblemSettings {...props} />
            </TabPanel>
            <TabPanel value={ProblemSettingsTabs.VIEW_PROBLEM.toString()}>
                <RendererPreview 
                    defaultPath={props.selected.webworkQuestionPath} 
                    dropdownPaths={
                        _.concat([props.selected.webworkQuestionPath], props.selected.courseQuestionAssessmentInfo?.additionalProblemPaths ?? [])}/>
            </TabPanel>
        </TabContext>
    </div>;
};
