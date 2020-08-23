import React, { useEffect, useState } from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import EnrollmentsTab from './CourseDetailsTabs/EnrollmentsTab';
import TopicsTab from './CourseDetailsTabs/TopicsTab';
import { useParams } from 'react-router-dom';
import AxiosRequest from '../Hooks/AxiosRequest';
import GradesTab from './CourseDetailsTabs/GradesTab';
import StatisticsTab from './CourseDetailsTabs/StatisticsTab';
import { DragDropContext } from 'react-beautiful-dnd';
import { CourseObject } from './CourseInterfaces';
import ActiveTopics from './CourseDetailsTabs/ActiveTopics';
import { UserRole, getUserRole, getUserId } from '../Enums/UserRole';
import Cookies from 'js-cookie';
import { CookieEnum } from '../Enums/CookieEnum';
import _ from 'lodash';
import { CourseDetailsTab } from './CourseDetailsTabs/CourseDetailsTab';
import { putUnit } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';

interface CourseDetailsPageProps {

}

enum CourseDetailsTabs {
    TOPICS = 'Topics',
    ENROLLMENTS = 'Enrollments',
    DETAILS = 'Details',
    GRADES = 'Grades',
    STATISTICS = 'Statistics',
    STUDENT_GRADES = 'Student Grades',
}

/**
 * This page renders a tabbed view of course details. If a user is a professor, this will have an additional tab
 * to view enrolled students and send emails.
 *
 */
export const CourseDetailsPage: React.FC<CourseDetailsPageProps> = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState<CourseObject>(new CourseObject());
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<CourseDetailsTabs>(CourseDetailsTabs.DETAILS);
    const userType: UserRole = getUserRole();
    const userId: number = getUserId();
    const [studentNameAndId, setStudentNameAndId] = useState<{name: string, userId: number} | null>(null);

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
            }
            setLoading(false);
        })();
    }, [courseId]);

    const setStudentGradesTab = (studentName: string, studentId: number) => {
        setStudentNameAndId({name: studentName, userId: studentId});
        setActiveTab(CourseDetailsTabs.STUDENT_GRADES);
    };

    const onUnitDragEnd = async (result: any) => {
        const { draggableId: unitDraggableId } = result;
        const unitIdRegex = /^unitRow(\d+)$/;
        const newContentOrder = result.destination.index + 1;
        // If exec doesn't match the result will be null
        // If it does succeed the index `1` will always be the group above
        const unitId = unitIdRegex.exec(unitDraggableId)?.[1];

        try {
            if (_.isNil(unitId)) {
                // This should not be possible
                console.error('unitId was nil when dropping');
                throw new Error('Something went wrong with drag and drop');
            }
            // TODO use the result to update the updated objects
            const response = await putUnit({
                id: parseInt(unitId, 10),
                data: {
                    contentOrder: newContentOrder
                }
            });
            console.log(response);
        } catch (e) {
            console.error(e);
            throw e;
        }

        const newCourse = new CourseObject(course);
        const [removed] = newCourse.units.splice(result.source.index, 1);
        newCourse.units.splice(result.destination.index, 0, removed);
        setCourse(newCourse);
    };

    const onTopicDragEnd = async (result: any) => {
        const { draggableId: topicDraggableId } = result;
        // Index is 0 based, while content order is 1 based
        const newContentOrder = result.destination.index + 1;
        const topicIdRegex = /^topic-(\d+)$/;
        // If exec doesn't match the result will be null
        // If it does succeed the index `1` will always be the group above
        const topicId = topicIdRegex.exec(topicDraggableId)?.[1];

        const sourceUnitDroppableId = result.source.droppableId;
        const destinationUnitDroppableId = result.destination.droppableId;

        const updates: any = {
            contentOrder: newContentOrder
        };
        const unitIdRegex = /^topicList-(\d+)$/;
        const destinationUnitId = unitIdRegex.exec(destinationUnitDroppableId)?.[1];
        const sourceUnitId = unitIdRegex.exec(sourceUnitDroppableId)?.[1];

        if(_.isNil(destinationUnitId)) {
            console.error('Could not parse desintationUnitId');
            return;
        }

        if(_.isNil(sourceUnitId)) {
            console.error('Could not parse sourceUnitId');
            return;
        }

        if (sourceUnitDroppableId !== destinationUnitDroppableId) {
            updates.courseUnitContentId = destinationUnitId;
        }

        // TODO use the result to update the updated objects
        const res = await AxiosRequest.put(`/courses/topic/${topicId}`, updates);

        const newCourse = new CourseObject(course);
        const sourceUnit = _.find(newCourse.units, ['id', parseInt(sourceUnitId, 10)]);
        const destinationUnit = sourceUnitId === destinationUnitId ? sourceUnit :_.find(newCourse.units, ['id', parseInt(destinationUnitId, 10)]);

        if(_.isNil(sourceUnit)) {
            console.error('Could not find source unit');
            return;
        }

        if(_.isNil(destinationUnit)) {
            console.error('Could not find destination unit');
            return;
        }
        const [removed] = sourceUnit.topics.splice(result.source.index, 1);
        destinationUnit.topics.splice(result.destination.index, 0, removed);

        setCourse(newCourse);
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) {
            return;
        }
    
        if (result.destination.index === result.source.index) {
            return;
        }

        console.log('onDragEnd!', result);

        if (result.type === 'UNIT') {
            onUnitDragEnd(result);
        } else if (result.type === 'TOPIC') {
            onTopicDragEnd(result);
        } else {
            console.error(`Invalid result.type "${result.type}"`);
        }
    };

    if (!courseId) return <div>Please return to login.</div>;

    return (
        <Container>
            <Tabs 
                activeKey={activeTab} 
                defaultActiveKey={CourseDetailsTabs.DETAILS} 
                id="course-details-tabs" 
                onSelect={(activeTab: any) => {
                    setActiveTab(activeTab);
                    setStudentNameAndId(null);
                }}>
                <Tab eventKey={CourseDetailsTabs.DETAILS} title={CourseDetailsTabs.DETAILS}  style={{marginBottom:'10px'}}>
                    <CourseDetailsTab course={course} error={error} loading={loading} setCourse={setCourse} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.TOPICS} title={CourseDetailsTabs.TOPICS}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <TopicsTab course={course} setCourse={setCourse} />
                    </DragDropContext>
                </Tab>
                <Tab eventKey={CourseDetailsTabs.ENROLLMENTS} title="Enrollments">
                    <EnrollmentsTab courseId={parseInt(courseId, 10)} courseCode={course.code} />
                </Tab>
                <Tab eventKey={CourseDetailsTabs.GRADES} title={CourseDetailsTabs.GRADES}>
                    {/* Students' Grades view is really the statisics view. */}
                    {userType === UserRole.STUDENT ? 
                        <StatisticsTab course={course} userId={userId} /> : 
                        <GradesTab course={course} setStudentGradesTab={setStudentGradesTab} />}
                </Tab>
                {userType !== UserRole.STUDENT && (
                    <Tab eventKey={CourseDetailsTabs.STATISTICS} title={CourseDetailsTabs.STATISTICS}>
                        <StatisticsTab course={course} />
                    </Tab>)}
                {studentNameAndId !== null && (
                    <Tab eventKey={CourseDetailsTabs.STUDENT_GRADES} title={`${studentNameAndId.name}'s Grades`}>
                        <StatisticsTab course={course} userId={studentNameAndId.userId} />
                    </Tab>)}
            </Tabs>
        </Container>
    );
};

export default CourseDetailsPage;