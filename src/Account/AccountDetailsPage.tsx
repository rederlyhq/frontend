import React, { useEffect, useState } from 'react';
import { Avatar, Grid, TextField } from '@material-ui/core';
import _ from 'lodash';
import localPreferences, { AccountType } from '../Utilities/LocalPreferences';
import { getUserRole, UserRole } from '../Enums/UserRole';
import AxiosRequest from '../Hooks/AxiosRequest';
import logger from '../Utilities/Logger';
const { session, account } = localPreferences;

interface AccountDetailsPageProps {

}

export const AccountDetailsPage: React.FC<AccountDetailsPageProps> = () => {
    const userName = session.username;
    const [paymentURL, setPaymentURL] = useState<string | null>(null);
    const [paidUntilMoment, setPaidUntilMoment] = useState<moment.Moment | null>(null);

    useEffect(() => {
        (async () => {
            const rederlyConfig = await window.rederlyConfig;
            setPaymentURL(rederlyConfig?.paymentURL ?? null);

            try {
                const res = await AxiosRequest.get('/users/status');
                const data = res.data.data as { userPaidUntil: Date, universityPaidUntil: Date };
                const userPaidMoment = data.userPaidUntil.toMoment();
                const universityPaidMoment = data.universityPaidUntil.toMoment();

                const paidUntil = userPaidMoment;
                setPaidUntilMoment(userPaidMoment);
                let accountType: AccountType | undefined;
                if (userPaidMoment.isAfter(universityPaidMoment)) {
                    accountType = AccountType.INDIVIDUAL;
                } else if (userPaidMoment.isSame(universityPaidMoment)) {
                    accountType = AccountType.INSTITUTIONAL;
                } else {
                    accountType = AccountType.DISABLED;
                }

                account.paidUntil = paidUntil.toDate();
                account.accountOwner = accountType;
            } catch (e) {
                logger.error('Could not get user status', e);
            }
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
                {paidUntilMoment && <Grid item>
                    <p>
                        <strong>Paid Until: </strong>{`${paidUntilMoment.format('LL')}`}
                        <br />
                        {paymentURL && getUserRole() !== UserRole.STUDENT &&
                            <a href={paymentURL} target={paymentURL}>Renew your account</a>
                        }
                    </p>
                </Grid>}
            </Grid>
        </Grid>
    );
};

export default AccountDetailsPage;