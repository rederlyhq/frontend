import React from 'react';

interface StudentGradesListProps {
    grades: Array<any>
}

export const StudentGradesList: React.FC<StudentGradesListProps> = ({grades}) => {
    return (
        <div>
            {grades.map((grade: any) => (
                <div key={`grade${grade.id}`}>
                    Problem: {grade.courseWWTopicQuestionId}, 
                    Best Grade: {grade.bestScore}
                </div>
            ))
            }
        </div>
    );
};

export default StudentGradesList;