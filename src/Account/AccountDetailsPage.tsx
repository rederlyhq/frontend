import React, { useEffect, useState } from 'react';
import { Avatar, Grid, TextField } from '@material-ui/core';
import _ from 'lodash';
import localPreferences from '../Utilities/LocalPreferences';
const { session, account } = localPreferences;

interface AccountDetailsPageProps {

}

export const AccountDetailsPage: React.FC<AccountDetailsPageProps> = () => {
    const userName = session.username;
    const [paymentURL, setPaymentURL] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const rederlyConfig = await window.rederlyConfig;
            setPaymentURL(rederlyConfig?.paymentURL ?? null);
        })();
    }, []);

    return (
        <Grid container item spacing={3} xs={6} justify='center'>
            <Grid container item xs={12} justify='center'>
                <Avatar alt={`${userName}'s Avatar`} style={{height: '8em', width: '8em'}}>
                    {/* Renders Avatars with a user's initials */}
                    {_.chain(userName).words().map(w => w[0]).join('').value()}
                </Avatar>
            </Grid>
            <Grid container item xs={12} justify='center' direction='column' alignItems='center' spacing={5}>
                <TextField id="user-name" label="Name" value={userName} disabled />
                <Grid item>
                    <p>
                        <strong>Paid Until: </strong>{`${account.paidUntil?.toDateString()}`}
                        <br />
                        {paymentURL &&
                            <a href={paymentURL}>Renew your account</a>
                        }
                    </p>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default AccountDetailsPage;