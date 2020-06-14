import React from 'react';
import EmailComponentWrapper from '../Courses/CourseDetailsTabs/EmailComponentWrapper';
import { UserObject } from '../Courses/CourseInterfaces';
import AdviseesPassRate from './AdviseesPassRate';
import AdviseesStackedBar from './AdviseesStackedBar';
import { Container, Col, Row } from 'react-bootstrap';

interface AdviserPageProps {

}

const mock_users = [
    new UserObject({firstName: 'Mary', lastName: 'Jane', id: 1}),
    new UserObject({firstName: 'Peter', lastName: 'Parker', id: 4}),
    new UserObject({firstName: 'Carnage', lastName: '', id: 2}),
    new UserObject({firstName: 'Dr.', lastName: 'X', id: 3}),
];

const mock_advisees_passing = {
    labels: ['Passing', 'Failing'],
    datasets: [{
        data: [20, 2],
        backgroundColor: ['#00ff00', '#ff0000'],
        borderColor: ['#00ff00', '#ff0000'],
        borderWidth: 1
    }],
    options: {
        tooltips: {
            callbacks: {
                label: function(tooltip: any, object: any) {
                    if (tooltip.index === 1) {
                        return 'Failing Students: Mary Jane, Peter Parker';
                    } else {
                        return 'Passing Students: Carnage, Dr. X, and 18 others';
                    }
                }
            }
        }
    }
};

const mock_advisees_grades = {
    labels: ['Mary Jane', 'Peter Parker', 'Carnage', 'Dr. X'],
    datasets: [{
        label: 'Math 120',
        stack: 'Math 120',
        data: [2, 2, 100, 100],
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderColor: 'rgba(255,99,132,1)',
    },
    {
        label: 'Math 131',
        stack: 'Math 131',
        data: [20, 10, 80, 80],
        backgroundColor: 'rgba(25,99,132,0.2)',
        borderColor: 'rgba(25,99,132,1)',
    },
    ],
    options: {
        scales: {
            xAxes: [{
                stacked: true
            }],
            yAxes: [{
                stacked: true
            }]
        }
    }
};

export const AdviserPage: React.FC<AdviserPageProps> = () => {
    return (
        <div className='text-center'>
            <h1>Adviser View</h1>
            <Container>
                <Row style={{border: '1px solid black', padding: '5px'}}>
                    <Col style={{borderRight: '1px solid black'}}><EmailComponentWrapper users={mock_users}/></Col>
                    <Col><AdviseesPassRate data={mock_advisees_passing} options={mock_advisees_passing.options}/></Col>
                </Row>
                <Row style={{border: '1px solid black', padding: '5px'}}>
                    <Col>
                        <AdviseesStackedBar data={mock_advisees_grades} options={mock_advisees_grades.options} />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdviserPage;