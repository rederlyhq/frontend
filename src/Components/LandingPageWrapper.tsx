import React from 'react';
import { Grid, Container } from '@material-ui/core';

interface LandingPageWrapperProps {

}

/**
 * This is a wrapper for any page that doesn't have the toolbar header.
 */
export const LandingPageWrapper: React.FC<LandingPageWrapperProps> = ({children}) => {
    return (
        <Container style={{'height': '100vh'}}>
            <Grid container style={{flexDirection: 'column', height: '80%'}} justify='space-evenly'>
                <a href="/" style={{alignSelf: 'center'}}>
                    <img
                        src={'/rederly-logo-dark.png'}
                        alt='Rederly logo'
                        style={{height: '20vh'}}
                    />
                </a>
                {children}
            </Grid>
        </Container>
    );
};

export default LandingPageWrapper;