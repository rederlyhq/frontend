import React from 'react';
import { Container, Tabs, Tab, Grid } from '@material-ui/core';
import AccountDetailsPage from './AccountDetailsPage';
import AccountChangePasswordPage from './AccountChangePasswordPage';
import { StudentTopicPreferences } from './StudentTopicPreferences';

interface AccountWrapperProps {

}

export const AccountWrapper: React.FC<AccountWrapperProps> = () => {
    const [tabKey, setTabKey] = React.useState<number>(0);

    const renderTab = () => {
        switch(tabKey) {
        case 0:
        default:
            return <AccountDetailsPage />;
        case 1:
            return <AccountChangePasswordPage />;
        case 2:
            return <StudentTopicPreferences />;
        }
    };

    return (
        <Container style={{marginTop: '1rem'}}>
            <Grid container spacing={3}>
                <Grid container item xs={3}>
                    <Tabs
                        orientation='vertical'
                        variant='scrollable'
                        value={tabKey}
                        onChange={(event: React.ChangeEvent<{}>, newValue: number) => {setTabKey(newValue);}}
                        aria-label='Account Page Navigation'
                    >
                        <Tab label={'Details'} />
                        <Tab label={'Change Password'} />
                        <Tab label={'Settings'} />
                    </Tabs>
                </Grid>
                {renderTab()}
            </Grid>
        </Container>
    );
};

export default AccountWrapper;