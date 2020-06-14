import React, { useEffect, useState } from 'react';
import StudentGradesList from './StudentGradesList';
import AxiosRequest from '../../Hooks/AxiosRequest';

interface GradesTabProps {
    courseId: number
}

/**
 * This tab conditionally shows grades for either:
 *  1. A student, showing detailed grades for each topic, or:
 *  2. A professor, showing summary grades for each student.
 * 
 */
export const GradesTab: React.FC<GradesTabProps> = ({courseId}) => {
    const [selfGrades, setSelfGrades] = useState([]);

    useEffect(()=>{
        (async () => {
            const res = await AxiosRequest.get('/users/3?courseId=73&includeGrades=JUST_GRADE');
            if (res.status !== 200) {
                console.error('Bad status code');
                return;
            }
            const grades = res.data?.data?.grades;
            console.log(grades);
            setSelfGrades(grades);
        })();
    }, []);

    return (
        <div>
            {/* TODO: List Course Summary Grades */}
            <StudentGradesList grades={selfGrades}/>
        </div>
    );
};

export default GradesTab;