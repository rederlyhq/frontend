import React, { useEffect, useState } from 'react';
import CourseList from './CourseList';
import AxiosRequest from '../Hooks/AxiosRequest';

interface CoursePageProps {

}

export const CoursePage: React.FC<CoursePageProps> = () => {
    const [courses, setCourses] = useState<Array<String>>([]);

    // Get the list of courses to render.
    useEffect(() => {
        (async () => {
            try {
                let res = await AxiosRequest.get('/courses');
                console.log(res.data.data);
                setCourses(res.data?.data.map((a: any) => a.course_name));
            } catch (e) {
                console.log(e.response);
                setCourses([]);
            }
        })();
    }, []);

    return (
        <div>
            <h1>My Courses</h1>
            <CourseList courses={courses}/>
        </div>
    );
};
export default CoursePage;