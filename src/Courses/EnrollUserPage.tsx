import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import logger from '../Utilities/Logger';
import { enrollByCode } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import localPreferences from '../Utilities/LocalPreferences';
import { gaTrackEnroll } from '../Hooks/useTracking';
import { Container, Grid } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

interface EnrollUserPageProps {

}

// TODO: Use Axios.Request JSX to selectively render success or failure.
export const EnrollUserPage: React.FC<EnrollUserPageProps> = () => {
    const { enrollCode } = useParams<{
        enrollCode: string
    }>();
    const [{enrollData, enrollError}, setVerifyState] = useState({enrollData: {courseId: -1}, enrollError: ''});
    const userId: string | null = localPreferences.session.userId;

    // Async functions return promises regardlessly, and this angers Typescript. IIFE is the workaround.
    useEffect(() => {
        if (!enrollCode) return;
        (async () => {
            try {
                // The param was double uri encoded
                // grabbing it from the params peels off the first layer
                // express peels off the second layer
                const res = await enrollByCode({
                    enrollCode: enrollCode
                });

                if (res.status !== 200) {
                    logger.warn(`Enroll by code Succeeded with a non 200 status code: ${res.status}`);
                }
                gaTrackEnroll(enrollCode);
                setVerifyState({
                    enrollData: res.data.data,
                    enrollError: ''
                });
            } catch (e) {
                // This is not an error, this can be triggered by giving an invalid code
                logger.debug('Enrollment failed', e);
                setVerifyState({
                    enrollError: e.message,
                    enrollData: {courseId: -1}
                });
            }
        })();
    }, [enrollCode, userId]);

    // TODO: Redirect back to home after timeout?
    if (!enrollCode) return <div>This page is no longer valid.</div>;

    return (
        <Container>
            <Grid>
                <h1>Course Enrollment</h1>
                <div>
                    {enrollError ?
                        <Alert severity='error'>{enrollError}</Alert> :
                        (enrollData.courseId > -1 ? <>
                            <Alert severity='success'>You have been enrolled in this class! <Link to={`/common/courses/${enrollData.courseId}`}>Visit the class now.</Link></Alert>
                        </> : <h2>Loading...</h2>)
                    }
                </div>
            </Grid>
        </Container>
    );
};

export default EnrollUserPage;