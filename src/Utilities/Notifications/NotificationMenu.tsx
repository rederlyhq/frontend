import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Notifications } from '@material-ui/icons';
import { Badge } from '@material-ui/core';

const ITEM_HEIGHT = 48;

interface NotificationMenuProps {
    notifications: any[];
}

export const NotificationMenu:React.FC<NotificationMenuProps> = ({notifications}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Badge badgeContent={notifications.length} color="primary">
                <IconButton
                    aria-label="more"
                    aria-controls="long-menu"
                    aria-haspopup="true"
                    onClick={handleClick}
                >
                    <Notifications />
                </IconButton>
            </Badge>
            <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: ITEM_HEIGHT * 4.5,
                        width: '20ch',
                    },
                }}
            >
                {notifications.map((notification) => (
                    <MenuItem key={notification} onClick={handleClose}>
                        {notification}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default NotificationMenu;