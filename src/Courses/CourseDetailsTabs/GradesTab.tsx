import React, { useEffect, useState } from 'react';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { Nav } from 'react-bootstrap';
import GradeTable from './GradeTable';
import _ from 'lodash';
import SubObjectDropdown from '../../Components/SubObjectDropdown';
import { UnitObject, TopicObject, ProblemObject, CourseObject } from '../CourseInterfaces';
import { CookieEnum } from '../../Enums/CookieEnum';
import Cookies from 'js-cookie';
import { UserRole, getUserRole } from '../../Enums/UserRole';

interface GradesTabProps {
    course: CourseObject;
}

enum GradesView {
    OVERVIEW = 'Overview',
    UNITS = 'Units',
    TOPICS = 'Topics',
    PROBLEMS = 'Problems'
}

interface IDropdownCascade {
    unit?: UnitObject,
    topic?: TopicObject,
    problem?: ProblemObject
}

/**
 * This tab conditionally shows grades for either:
 *  1. A student, showing detailed grades for each topic, or:
 *  2. A professor, showing summary grades for each student.
 * 
 */
export const GradesTab: React.FC<GradesTabProps> = ({course}) => {
    const [view, setView] = useState<string>(GradesView.OVERVIEW);
    const [selectedObjects, setSelectedObjects] = useState<IDropdownCascade>({});
    const [viewData, setViewData] = useState<Array<any>>([]);
    const userId: string | undefined = Cookies.get(CookieEnum.USERID);
    const userType: UserRole = getUserRole(Cookies.get(CookieEnum.USERTYPE));

    const handleChangedView = (selectedView: string) => {
        console.log('handling changing view', selectedView);
        setView(selectedView);
        if (selectedView === GradesView.OVERVIEW) {
            setSelectedObjects({});
        } else if (_.startsWith(selectedView, GradesView.UNITS)) {
            const selectedUnitId = parseInt(_.trimStart(selectedView, `${GradesView.UNITS}-`), 10);
            setSelectedObjects({unit: _.find(course.units, ['id', selectedUnitId])});
        } else if (_.startsWith(selectedView, GradesView.TOPICS)) {
            const selectedTopicId = parseInt(_.trimStart(selectedView, `${GradesView.TOPICS}-`), 10);
            const selectedTopic = _.find(selectedObjects.unit?.topics, ['id', selectedTopicId]);
            setSelectedObjects({unit: selectedObjects.unit, topic: selectedTopic});
        } else if (_.startsWith(selectedView, GradesView.PROBLEMS)) {
            const selectedQuestionId = parseInt(_.trimStart(selectedView, `${GradesView.PROBLEMS}-`), 10);
            const selectedQuestion = _.find(selectedObjects.topic?.questions, ['id', selectedQuestionId]);
            setSelectedObjects({...selectedObjects, problem: selectedQuestion});
        }
    };

    // This hook gets the grades for all users, filtered by the type of view selected.
    const getCourseGradesHook = () => {
        if (_.isNil(course) || !course.id) return;
        (async () => {
            let urlArg = `courseId=${course.id}`;
            if (selectedObjects.problem) {
                urlArg = `questionId=${selectedObjects.problem?.id}`;
            } else if (selectedObjects.topic) {
                urlArg = `topicId=${selectedObjects.topic?.id}`;
            } else if (selectedObjects.unit) {
                urlArg = `unitId=${selectedObjects.unit?.id}`;
            }
            const res = await AxiosRequest(`/courses/grades?${urlArg}`);

            const gradesArr: Array<any> = res.data.data || [];

            const flatGradesArr = _.map(gradesArr, grade => {
                const mergedGrade = {...grade.user, ...grade};
                delete mergedGrade.user;
                delete mergedGrade.id;
                return mergedGrade;
            });

            setViewData(flatGradesArr);
        })();
    };

    // This hook is intended to get the grades for the user that is currently signed in.
    const getSelfGradesHook = () => {
        (async () => {
            if (!userId || userId === 'undefined') {
                console.error('Failed to retrieve userId from session.');
                return;
            }

            const res = await AxiosRequest.get(`/users/${userId}?courseId=${course.id}&includeGrades=JUST_GRADE`);
            if (res.status !== 200) {
                console.error('Bad status code');
                return;
            }
            const grades = res.data?.data?.grades;
            if (!grades) {
                console.error('Failed to download grades.', res);
                return;
            }

            console.log(grades);
            setViewData(grades.map((grade: any) => {
                let gradeRow = grade;
                delete gradeRow.id;
                delete gradeRow.userId;
                delete gradeRow.user_id;
                delete gradeRow.randomSeed;
                delete gradeRow.createdAt;
                delete gradeRow.updatedAt;
                return gradeRow;
                // TODO: How do we get the question number from the problem?
            }));
        })();
    };

    useEffect((userType === UserRole.STUDENT ? getSelfGradesHook : getCourseGradesHook), [course.id, selectedObjects]);

    if (!course) return null;

    return (
        <>
            <Nav fill variant='pills' activeKey={view} onSelect={(selectedKey: string) => handleChangedView(selectedKey)}>
                <Nav.Item>
                    <Nav.Link eventKey={GradesView.OVERVIEW}>
                        Overview
                    </Nav.Link>
                </Nav.Item>
                <SubObjectDropdown 
                    title={selectedObjects.unit?.name || GradesView.UNITS} 
                    eventKey={GradesView.UNITS} 
                    eventKeyState={view} 
                    subObjArray={course.units} />
                <SubObjectDropdown 
                    title={selectedObjects.topic?.name || GradesView.TOPICS} 
                    eventKey={GradesView.TOPICS} 
                    eventKeyState={view} 
                    subObjArray={selectedObjects.unit?.topics || []} 
                    style={{visibility: selectedObjects.unit ? 'visible' : 'hidden'}} />
                <SubObjectDropdown 
                    title={selectedObjects.problem ? `Problem ${selectedObjects.problem.problemNumber}` : GradesView.PROBLEMS} 
                    eventKey={GradesView.PROBLEMS} 
                    eventKeyState={view} 
                    subObjArray={selectedObjects.topic?.questions.sort((a, b) => a.problemNumber < b.problemNumber ? -1 : 1) || []} 
                    style={{visibility: selectedObjects.topic ? 'visible' : 'hidden'}} />
            </Nav>
            {viewData ? <GradeTable courseName={course.name} grades={viewData}/> : <div>No data!</div>}
        </>
    );
};

export default GradesTab;
