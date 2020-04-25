import React, { useEffect, useState } from 'react';
import CourseList from './CourseList';

interface CoursePageProps {

}

export const CoursePage: React.FC<CoursePageProps> = () => {
    const [courses, setCourses] = useState<Array<String>>([]);

    // Get the list of courses to render.
    useEffect(() => {
        setCourses(["Course 1", "Course 2", "Crouse 3"]);
    }, []);

    return (
        <div>
            <h1>My Courses</h1>
            <CourseList courses={courses}/>
        </div>
    );
};
export default CoursePage;