import React, { useState, useEffect } from 'react';
import { AppBar, Tab, Tabs } from '@material-ui/core';
import { TabPanel, TabContext } from '@material-ui/lab';
import ProblemSettings from './ProblemSettings';
import { ProblemObject, TopicObject } from '../CourseInterfaces';
import RendererPreview from './RendererPreview';
import _ from 'lodash';
import useQuerystringHelper, { QueryStringMode } from '../../Hooks/useQuerystringHelper';
import { VerticalDivider } from '../../Components/VerticalDivider';

interface ProblemSettingsProps {
    selected: ProblemObject;
    // Used to reset the selected bar after a deletion occurs.
    setSelected: React.Dispatch<React.SetStateAction<TopicObject | ProblemObject>>;
    setTopic: React.Dispatch<React.SetStateAction<TopicObject | null>>;
    topic: TopicObject;
    triggerRegrade: () => unknown;
    fetchTopic: () => Promise<TopicObject | null>;
}

function a11yProps(index: any) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`,
    };
}

enum ProblemSettingsTabs {
    VIEW_PROBLEM = 0,
    EDIT_PROBLEM = 2,
}

export const ProblemSettingsViewEditPanels: React.FC<ProblemSettingsProps> = (props) => {
    const {getCurrentQueryStrings, updateRoute} = useQuerystringHelper();
    const preselectedTabTypeUnsafe = getCurrentQueryStrings().problemView;
    const preselectedTabStr = _.isArray(preselectedTabTypeUnsafe) ? preselectedTabTypeUnsafe.first : preselectedTabTypeUnsafe;
    const preselectedTab = preselectedTabStr ? parseInt(preselectedTabStr, 10) : null;
    const [value, setValue] = useState<ProblemSettingsTabs>((preselectedTab as ProblemSettingsTabs | undefined) ?? ProblemSettingsTabs.VIEW_PROBLEM);

    useEffect(()=>{
        updateRoute({problemView: {
            val: value.toString(),
            mode: QueryStringMode.OVERWRITE,
        }}, true);
    }, [updateRoute, value]);
  
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
                    <Tab label='View' {...a11yProps(ProblemSettingsTabs.VIEW_PROBLEM)} />
                    <VerticalDivider orientation='vertical' variant='middle' flexItem />
                    <Tab label='Settings' {...a11yProps(ProblemSettingsTabs.EDIT_PROBLEM)} />
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
