import React, { useEffect, useState } from 'react';
import { Jumbotron } from 'react-bootstrap';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import Axios from '../Hooks/AxiosRequest';
import Cookies from 'js-cookie';
import { CookieEnum } from '../Enums/CookieEnum';

interface EnrollUserPageProps {

}

// TODO: Use Axios.Request JSX to selectively render success or failure.
export const EnrollUserPage: React.FC<EnrollUserPageProps> = () => {
    const { enrollCode } = useParams();
    const [{enrollData, enrollError}, setVerifyState] = useState({enrollData: {courseId: -1}, enrollError: ''});
    const userId: string | undefined = Cookies.get(CookieEnum.USERID);
    
    // Async functions return promises regardlessly, and this angers Typescript. IIFE is the workaround.
    useEffect(() => {
        if (!enrollCode) return;
        (async () => {
            try {
                const res = await Axios.post(`/courses/enroll/${enrollCode}`, {userId: userId});
                if (res.status === 200) {
                    console.log(res.data);
                    setVerifyState({enrollData: res.data.data, enrollError: ''});
                }
            } catch (e) {
                setVerifyState({enrollError: 'An error occurred.', enrollData: {courseId: -1}});
            }
        })();
    }, [enrollCode, userId]);
    
    // TODO: Redirect back to home after timeout?
    if (!enrollCode) return <div>This page is no longer valid.</div>;

    return (
        <Jumbotron>
            {enrollError && <h2>{enrollError}</h2>}
            {enrollData && <>
                <h4>You have been enrolled in this class!</h4>
                <h3><Link to={`/common/courses/${enrollData.courseId}`}>Visit the class now.</Link></h3>
            </>}
        </Jumbotron>
    );
};

export default EnrollUserPage;