import { Backdrop, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';
import { CourseObject } from './CourseInterfaces';

interface CourseProviderProps {
    children: React.ReactNode
}

const CourseContext = React.createContext<{
        course: CourseObject, 
        setter: React.Dispatch<React.SetStateAction<CourseObject>> | undefined,
        error: string | null
    }>({
        course: new CourseObject(), 
        setter: undefined,
        error: null,
    });

export const useCourseContext = () => React.useContext(CourseContext);

export const CourseProvider: React.FC<CourseProviderProps> = ({children}) => {
    const { courseId } = useParams<{courseId: string | undefined}>();
    const [course, setCourse] = useState<CourseObject>(new CourseObject());
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (!courseId) return;
            setLoading(true);
            setError(null);
            try {
                const courseResp = await AxiosRequest.get(`/courses/${courseId}`);
                const fetchedCourse = new CourseObject(courseResp.data.data);
                setCourse(fetchedCourse);
            } catch (e) {
                setError(e.response.data.message);
                console.error(e);
            }
            setLoading(false);
        })();
    }, [courseId]);

    return (
        <CourseContext.Provider value={{course, setter: setCourse, error}}>
            <Backdrop open={loading}>
                <CircularProgress/>
            </Backdrop>
            {children}
        </CourseContext.Provider>
    );
};

export default CourseProvider;