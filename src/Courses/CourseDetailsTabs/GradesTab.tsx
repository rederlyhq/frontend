import React, { useEffect, useState } from 'react';
import StudentGradesList from './StudentGradesList';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { Nav, Table, DropdownButton, NavDropdown } from 'react-bootstrap';
import GradeTable from './GradeTable';
import _ from 'lodash';
import SubObjectDropdown from '../../Components/SubObjectDropdown';
import { UnitObject, TopicObject, ProblemObject, CourseObject } from '../CourseInterfaces';

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
    const [selfGrades, setSelfGrades] = useState([]);
    const [view, setView] = useState<string>('Units');
    const [selectedObjects, setSelectedObjects] = useState<IDropdownCascade>({});

    const mockUnitsData = [
        {name: 'Tom', average: '10%', lowest: '0%', id: 1},
        {name: 'Tom', average: '10%', lowest: '0%', id: 2},
        {name: 'Tom', average: '10%', lowest: '0%', id: 3},
        {name: 'Tom', average: '10%', lowest: '0%', id: 4}
    ];

    console.log(course);

    let mockUnit = new UnitObject({name: 'Mock Unit'});
    let mockTopic = new TopicObject({name: 'Mock Topic'});
    let mockProblem = new ProblemObject({problemNumber: 1});

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

    console.log(selectedObjects);
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
                    subObjArray={selectedObjects.topic?.questions || []} 
                    style={{visibility: selectedObjects.topic ? 'visible' : 'hidden'}} />
            </Nav>
            <GradeTable grades={mockUnitsData}/>
        </>
    );
};

export default GradesTab;