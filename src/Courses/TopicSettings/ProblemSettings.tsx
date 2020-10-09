import React from 'react';
import { Grid } from '@material-ui/core';
import { NestedFormInterface, ProblemMaxAttempts, ProblemOptional, ProblemPath, ProblemWeight } from './GenericFormInputs';
import { Link } from 'react-router-dom';

interface ProblemSettingsProps {
    selectedProblemId: number;
}

export const ProblemSettings: React.FC<ProblemSettingsProps & NestedFormInterface> = ({selectedProblemId, register, watch}) => {
    const { optional } = watch();
    return (
        <Grid container item md={12} spacing={3}>
            <Grid item container md={12}><h1>Problem Settings</h1></Grid>
            <Grid item md={8}>
                Enter the path to the problem on the Rederly server. This is prefaced either 
                with <code>Library/</code> or <code>Contrib/</code> if this problem is included 
                in the <Link to='https://github.com/openwebwork/webwork-open-problem-library'>OPL</Link> or <code>private/</code> if 
                this problem has been uploaded to your private Rederly folder.
                {ProblemPath(register)}
            </Grid><Grid item md={12}>
                Enter the max attempts for a problem, or 0 or -1 for unlimited attempts.<br/>
                {ProblemMaxAttempts(register)}
            </Grid><Grid item md={12}>
                Enter the grading weight for this problem. Optional problems with weights will be treated as extra credit.<br/>
                {ProblemWeight(register)}
            </Grid><Grid item md={12}>
                This problem is {optional ? 'optional' : 'required'}.<br/>
                {ProblemOptional(register)}
            </Grid>
        </Grid>
    );
};

export default ProblemSettings;