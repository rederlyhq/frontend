import React from 'react';
import { Grid } from '@material-ui/core';
import { NestedFormInterface, ProblemMaxAttempts, ProblemOptional, ProblemPath, ProblemWeight } from './GenericFormInputs';
import { Link } from 'react-router-dom';

interface ProblemSettingsProps {
    selectedProblemId: number;
}

export const ProblemSettings: React.FC<ProblemSettingsProps & NestedFormInterface> = ({selectedProblemId, register}) => {
    return (
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h1>Problem Settings</h1></Grid>
            <Grid item md={8}>
                Enter the path to the problem on the Rederly server. This is prefaced either with <code>webwork-open-problem-library/</code> 
                if this problem is included in the <Link to='https://github.com/openwebwork/webwork-open-problem-library'>OPL</Link> or <code>private/</code> if this problem has been uploaded to your private Rederly folder.
                {ProblemPath(register)}
            </Grid><Grid item md={12}>
                {ProblemMaxAttempts(register)}
            </Grid><Grid item md={12}>
                {ProblemWeight(register)}
            </Grid><Grid item md={12}>
                {ProblemOptional(register)}
            </Grid>
        </Grid>
    );
};

export default ProblemSettings;