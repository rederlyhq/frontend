import React, { useEffect, useState } from 'react';
import { Jumbotron } from 'react-bootstrap';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { getVerification } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import logger from '../Utilities/Logger';

interface VerificationLandingPageProps {

}

// TODO: Use Axios.Request JSX to selectively render success or failure.
export const VerificationLandingPage: React.FC<VerificationLandingPageProps> = () => {
    const { uid } = useParams<{
        uid: string;
    }>();
    const [{verifyData, verifyError}, setVerifyState] = useState({verifyData: '', verifyError: ''});
    
    // Async functions return promises regardlessly, and this angers Typescript. IIFE is the workaround.
    useEffect(() => {
        if (!uid) return;
        (async () => {
            try {
                const res = await getVerification({
                    verifyToken: uid
                });
                if (res.status !== 200) {
                    logger.warn(`Verification succeeded but got a non 200 status code: ${res.status}`);
                }
                setVerifyState({verifyData: 'Success', verifyError: ''});
            } catch (e) {
                setVerifyState({verifyError: e.message, verifyData: ''});
            }
        })();
    }, [uid]);
    
    // TODO: Redirect back to home after timeout?
    if (!uid) return <div>This page is no longer valid.</div>;

    return (
        <Jumbotron>
            {verifyError && <h2>{verifyError}</h2>}
            {verifyData && <>
                <h4>Your account has been registered!</h4>
                <h2>Please <Link to='/'>click here</Link> to login and start your learning journey!</h2>
            </>}
        </Jumbotron>
    );
};

export default VerificationLandingPage;