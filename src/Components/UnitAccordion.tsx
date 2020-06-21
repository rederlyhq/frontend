import React from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import CastForEducationIcon from '@material-ui/icons/CastForEducation';

import { ExpandMore } from '@material-ui/icons';
import { Button } from 'react-bootstrap';
import { ListItemSecondaryAction } from '@material-ui/core';

interface UnitAccordionProps {

}

/**
 * This is intended to replace the TopicsList, and the Accordion wrapper around it.
 * It uses Material UI rather than Bootstrap. 
 */
export const UnitAccordion: React.FC<UnitAccordionProps> = ({}) => {
    return (
        <ExpansionPanel>
            <ExpansionPanelSummary
                expandIcon={<ExpandMore/>}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                Unit 1
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <List aria-label='topics assignments'>
                    <ListItem button>
                        <ListItemIcon>
                            <CastForEducationIcon/>
                        </ListItemIcon>
                        Topic One
                        <ListItemSecondaryAction>
                            <Button variant='danger'>Delete</Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
};

export default UnitAccordion;