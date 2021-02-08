import { Backdrop, CircularProgress } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourse } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { getUsersForCourse } from '../APIInterfaces/BackendAPI/Requests/UserRequests';
import { NamedBreadcrumbs, useBreadcrumbLookupContext } from '../Contexts/BreadcrumbContext';
import AxiosRequest from '../Hooks/AxiosRequest';
import { CourseObject, UserObject } from './CourseInterfaces';

interface CourseProviderProps {
    children: React.ReactNode
}

const CourseContext = React.createContext<{
        course: CourseObject,
        setCourse?: React.Dispatch<React.SetStateAction<CourseObject>>,
        error: string | null,
        users: UserObject[],
        setUsers?: React.Dispatch<React.SetStateAction<UserObject[]>>,
    }>({
        course: new CourseObject(),
        setCourse: undefined,
        error: null,
        users: [],
        setUsers: undefined,
    });

export const useCourseContext = () => React.useContext(CourseContext);

export const CourseProvider: React.FC<CourseProviderProps> = ({children}) => {
    const { courseId } = useParams<{courseId?: string}>();
    const [course, setCourse] = useState<CourseObject>(new CourseObject());
    const [users, setUsers] = useState<UserObject[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {setBreadcrumbLookup} = useBreadcrumbLookupContext();

    useEffect(() => {
        (async () => {
            if (!courseId) return;
            setLoading(true);
            setError(null);
            try {
                const courseRespPromise = getCourse({
                    courseId: parseInt(courseId, 10)
                });
                const userRespPromise = getUsersForCourse({courseId: parseInt(courseId, 10)});

                const [courseResp, userResp] = await Promise.all([courseRespPromise, userRespPromise]);
                setCourse(new CourseObject(courseResp.data.data));

                const usersArr = [];
                for (const user of userResp.data.data) {
                    usersArr.push(new UserObject(user));
                }

                setBreadcrumbLookup?.({[NamedBreadcrumbs.COURSE]: courseResp.data.data.name ?? 'Unnamed Course'});
                setUsers(usersArr);
            } catch (e) {
                setError(e.message);
            }
            setLoading(false);
        })();
    }, [courseId]);

    return (
        <CourseContext.Provider value={{course, setCourse, error, users, setUsers}}>
            <Backdrop open={loading}>
                <CircularProgress/>
            </Backdrop>
            {children}
        </CourseContext.Provider>
    );
};

export default CourseProvider;