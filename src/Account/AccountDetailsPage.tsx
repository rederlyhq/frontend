import React from 'react';
import { Avatar, Grid, TextField } from '@material-ui/core';
import { CookieEnum } from '../Enums/CookieEnum';
import Cookies from 'js-cookie';
import _ from 'lodash';

interface AccountDetailsPageProps {

}

export const AccountDetailsPage: React.FC<AccountDetailsPageProps> = () => {
    const userName = Cookies.get(CookieEnum.USERNAME);
    return (
        <Grid container item spacing={3} xs={6} justify='center'>
            <Grid container item xs={12} justify='center'>
                <Avatar alt={`${userName}'s Avatar`} style={{height: '8em', width: '8em'}}>
                    {/* Renders Avatars with a user's initials */}
                    {_.chain(userName).words().map(w => w[0]).join('').value()}
                </Avatar>
            </Grid>
            <Grid container item xs={12} justify='center'>
                <TextField id="user-name" label="Name" value={userName} disabled />
            </Grid>
        </Grid>
    );
};

export default AccountDetailsPage;