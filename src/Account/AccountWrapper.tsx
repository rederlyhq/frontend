import React from 'react';
import { Avatar, Container, Tabs, Tab, Grid } from '@material-ui/core';
import { CookieEnum } from '../Enums/CookieEnum';
import Cookies from 'js-cookie';
import _ from 'lodash';

interface AccountWrapperProps {

}

export const AccountWrapper: React.FC<AccountWrapperProps> = () => {
    const [tabKey, setTabKey] = React.useState<number>(0);
    const userName = Cookies.get(CookieEnum.USERNAME);
    console.log(userName);
    return (
        <Grid container spacing={3}>
            <Grid xs={3}>
                <Tabs
                    orientation='vertical'
                    variant='scrollable'
                    value={tabKey}
                    onChange={(event: React.ChangeEvent<{}>, newValue: number) => {setTabKey(newValue);}}
                    aria-label='Account Page Navigation'
                >
                    <Tab label={'Details'} />
                    <Tab label={'Settings'} />
                    <Tab label={'Grades'} />
                </Tabs>
            </Grid>
            <Grid xs={6}>
                <Avatar alt={`${userName}'s Avatar`} style={{height: '150px', width: '150px'}}>
                    {/* Renders Avatars with a user's initials */}
                    {_.chain(userName).words().map(w => w[0]).join('').value()}
                </Avatar>
            </Grid>
        </Grid>
    );
};

export default AccountWrapper;