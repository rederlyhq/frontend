import React, { useRef, useState } from 'react';
import { IconButton, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, Button } from '@material-ui/core';
import { MuiThemeProvider as ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Settings as SettingsIcon } from '@material-ui/icons';
import { TopicObject } from '../../CourseInterfaces';
import { useHistory, useLocation } from 'react-router-dom';
import { GrShift } from 'react-icons/gr';
import { MdLaunch, MdDelete, MdEdit, MdDoneAll } from 'react-icons/md';
import { green, red, deepOrange, indigo } from '@material-ui/core/colors';
import { getUserRole, UserRole } from '../../../Enums/UserRole';
interface TopicNavButtonProps {
    topic: TopicObject;
    onDelete?: _.CurriedFunction2<any, number, void>;
}

export const TopicNavButton: React.FC<TopicNavButtonProps> = ({topic, onDelete}) => {
    const IconButtonRef = useRef<HTMLButtonElement>();
    const [open, setOpen] = useState<boolean>(false);
    const history = useHistory();
    const location = useLocation();

    const theme = createMuiTheme({
        palette: {
            primary: indigo,
            secondary: red,
        },
    });
    const altTheme = createMuiTheme({
        palette: {
            primary: green,
            secondary: deepOrange,
        },
    });
      

    const handleClose = () => setOpen(false);
    const isNotStudent = getUserRole() !== UserRole.STUDENT;

    return (
        <>
            <IconButton innerRef={IconButtonRef} onClick={() => setOpen(true)} style={{float: 'right', left: '2%'}}>
                <SettingsIcon />
            </IconButton>
            <Popper open={open} anchorEl={IconButtonRef.current} role={undefined} transition placement='right-start'>
                {({ TransitionProps }) => (
                    <Grow
                        {...TransitionProps}
                        style={{ transformOrigin: 'left-top' }}
                    >
                        <Paper elevation={14}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList autoFocusItem={open} id={`menu-list-${topic.id}`}>
                                    <ThemeProvider theme={theme}>
                                        {isNotStudent && <MenuItem onClick={() => history.push(`${location.pathname}/topic/${topic.id}/settings`)}>
                                            <Button variant="text" color="primary" startIcon={<MdEdit />} >
                                                View / Settings
                                            </Button>
                                        </MenuItem>}
                                        <MenuItem onClick={() => history.push(`${location.pathname}/topic/${topic.id}/grading`)}>
                                            <Button variant="text" color="default" startIcon={<MdDoneAll />}>
                                                Grading
                                            </Button>
                                        </MenuItem>
                                        <ThemeProvider theme={altTheme}>
                                            <MenuItem onClick={() => history.push(`${location.pathname}/topic/${topic.id}`)}>
                                                <Button variant="text" color="primary" startIcon={<MdLaunch />} >
                                                    {isNotStudent ? 'Try Assignment' : 'Assignment'}
                                                </Button>
                                            </MenuItem>
                                            {isNotStudent && <MenuItem onClick={() => history.push(`${location.pathname}/settings?topicId=${topic.id}`)}>
                                                <Button variant="text" color="secondary" startIcon={<GrShift />}>
                                                    Extensions
                                                </Button>
                                            </MenuItem>}
                                        </ThemeProvider>
                                        {isNotStudent && onDelete && <MenuItem onClick={(e) => onDelete(e, topic.id)}>
                                            <Button variant="text" color="secondary" startIcon={<MdDelete />}>
                                                Delete
                                            </Button>
                                        </MenuItem>}
                                    </ThemeProvider>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
};