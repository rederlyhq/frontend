import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';

interface StatisticsTabProps {

}

enum StatisticsView {
    UNITS = 'UNITS',
    TOPICS = 'TOPICS',
    PROBLEMS = 'PROBLEMS',
}

export const StatisticsTab: React.FC<StatisticsTabProps> = () => {
    const [view, setView] = useState<string>(StatisticsView.UNITS);
    return (
        <>
            <Nav fill variant='pills' activeKey={view} onSelect={(selectedKey: string) => setView(selectedKey)}>
                <Nav.Item>
                    <Nav.Link eventKey={StatisticsView.UNITS}>
                        Units
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={StatisticsView.TOPICS}>
                        Topics
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={StatisticsView.PROBLEMS}>
                        Problems
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </>
    );
};

export default StatisticsTab;