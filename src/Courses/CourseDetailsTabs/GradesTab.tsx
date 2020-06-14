import React, { useEffect, useState } from 'react';
import StudentGradesList from './StudentGradesList';
import AxiosRequest from '../../Hooks/AxiosRequest';
import { Nav, Table, DropdownButton, NavDropdown } from 'react-bootstrap';
import GradeTable from './GradeTable';
import _ from 'lodash';
import SubObjectDropdown from '../../Components/SubObjectDropdown';
import { UnitObject, TopicObject, ProblemObject } from '../CourseInterfaces';

interface GradesTabProps {
    courseId: number
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
export const GradesTab: React.FC<GradesTabProps> = ({courseId}) => {
    const [selfGrades, setSelfGrades] = useState([]);
    const [view, setView] = useState<string>('Units');
    const [selectedObjects, setSelectedObjects] = useState<IDropdownCascade>({});

    const mockUnitsData = [
        {name: 'Tom', average: '10%', lowest: '0%', id: 1},
        {name: 'Tom', average: '10%', lowest: '0%', id: 2},
        {name: 'Tom', average: '10%', lowest: '0%', id: 3},
        {name: 'Tom', average: '10%', lowest: '0%', id: 4}
    ];

    const handleChangedView = (selectedView: string) => {
        console.log('handling changing view', selectedView);
        setView(selectedView);
        if (selectedView === GradesView.OVERVIEW) {
            setSelectedObjects({});
        } else if (_.startsWith(selectedView, GradesView.UNITS)) {
            let mockUnit = new UnitObject({name: 'Mock Unit'});
            setSelectedObjects({unit: mockUnit});
        } else if (_.startsWith(selectedView, GradesView.TOPICS)) {
            let mockTopic = new TopicObject({name: 'Mock Topic'});
            setSelectedObjects({unit: selectedObjects.unit, topic: mockTopic});
        } else if (_.startsWith(selectedView, GradesView.PROBLEMS)) {
            let mockProblem = new ProblemObject({problemNumber: 1});
            setSelectedObjects({...selectedObjects, problem: mockProblem});
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

    return (
        <>
            <Nav fill variant='pills' activeKey={view} onSelect={(selectedKey: string) => handleChangedView(selectedKey)}>
                <Nav.Item>
                    <Nav.Link eventKey={GradesView.OVERVIEW}>
                        Overview
                    </Nav.Link>
                </Nav.Item>
                <SubObjectDropdown title={GradesView.UNITS} eventKeyState={view} subObjArray={[{name: 'Unit 1', id: 1}]}/>
                <SubObjectDropdown title={GradesView.TOPICS} eventKeyState={view} subObjArray={[{name: 'Topic 1', id: 1}]} style={{visibility: selectedObjects.unit ? 'visible' : 'hidden'}}/>
                <SubObjectDropdown title={GradesView.PROBLEMS} eventKeyState={view} subObjArray={[{name: 'Problem 1', id: 1}]} style={{visibility: selectedObjects.topic ? 'visible' : 'hidden'}}/>
            </Nav>
            <GradeTable grades={mockUnitsData}/>
        </>
    );
};

export default GradesTab;