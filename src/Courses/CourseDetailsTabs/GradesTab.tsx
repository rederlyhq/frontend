import React from 'react';
import StudentGradesList from './StudentGradesList';

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
    return (
        <div>
            TODO: List Course Summary Grades
            <StudentGradesList />
        </div>
    );
};

export default GradesTab;