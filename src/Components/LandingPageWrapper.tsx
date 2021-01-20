import React from 'react';
import { Grid, Container } from '@material-ui/core';

interface LandingPageWrapperProps {

}

export const LandingPageWrapper: React.FC<LandingPageWrapperProps> = ({children}) => {
    return (
        <Container style={{'height': '100vh'}}>
            <Grid container style={{flexDirection: 'column', height: '80%'}} justify='space-evenly'>
                <img
                    src={'/rederly-logo-dark.png'}
                    alt='Rederly logo'
                    style={{height: '20vh', alignSelf: 'center'}}
                />
                {children}
            </Grid>
        </Container>
    );
};

export default LandingPageWrapper;