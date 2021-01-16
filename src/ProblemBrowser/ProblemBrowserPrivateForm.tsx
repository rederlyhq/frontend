import React from 'react';
import { Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';
import querystring from 'querystring';

interface ProblemBrowserPrivateFormProps {

}

export const ProblemBrowserPrivateForm: React.FC<ProblemBrowserPrivateFormProps> = () => {
    const history = useHistory();
    return (
        <>
            <h5 style={{padding:'1em'}}>Click submit to go through the list of problems you have authored.</h5>
            <Button
                color='primary'
                variant='contained'
                style={{margin:'1em'}}
                onClick={() => history.push(`/common/problem-browser/search?${querystring.stringify(_.omitBy({
                    type: 'private',
                }, _.isUndefined))}`)}>
                    Submit
            </Button>
        </>
    );
};