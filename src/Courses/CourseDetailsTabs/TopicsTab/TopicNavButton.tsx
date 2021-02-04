import React, { useRef, useState } from 'react';
import { IconButton, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, Button  } from '@material-ui/core';
import { Settings as SettingsIcon } from '@material-ui/icons';
import { TopicObject } from '../../CourseInterfaces';
import { useHistory, useLocation } from 'react-router-dom';
import { BsPencilSquare, BsTrash } from 'react-icons/bs';
import { MdLaunch } from 'react-icons/md';

interface TopicNavButtonProps {
    topic: TopicObject;
    onDelete: _.CurriedFunction2<any, number, void>;
}

export const TopicNavButton: React.FC<TopicNavButtonProps> = ({topic, onDelete}) => {
    const IconButtonRef = useRef<HTMLButtonElement>();
    const [open, setOpen] = useState<boolean>(false);
    const history = useHistory();
    const location = useLocation();

    const handleClose = () => setOpen(false);

    return (
        <>
            <IconButton innerRef={IconButtonRef} onClick={() => setOpen(true)} style={{float: 'right', left: '2%'}}>
                <SettingsIcon />
            </IconButton>
            <Popper open={open} anchorEl={IconButtonRef.current} role={undefined} transition>
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                    >
                        <Paper elevation={14}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList autoFocusItem={open} id={`menu-list-${topic.id}`}>
                                    <MenuItem onClick={() => history.push(`${location.pathname}/topic/${topic.id}/settings`)}>
                                        <Button fullWidth variant="text" color="primary" startIcon={<BsPencilSquare/>}>
                                            Edit
                                        </Button>
                                    </MenuItem>
                                    <MenuItem onClick={() => history.push(`${location.pathname}/settings`)}>
                                        <Button fullWidth variant="text" color="default" startIcon={<MdLaunch />}>
                                            Extensions
                                        </Button>
                                    </MenuItem>
                                    <MenuItem onClick={onDelete}>
                                        <Button fullWidth variant="text" color="secondary" startIcon={<BsTrash/>}>
                                            Delete
                                        </Button>
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
};