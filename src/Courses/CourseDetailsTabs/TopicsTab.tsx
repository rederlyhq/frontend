import React from 'react';
import TopicsList from '../TopicsList';

interface TopicsTabProps {

}

const mock_topics = ['addition', 'subtraction', 'multiplication', 'english'];
const mock_units = [
    {name: 'Unit 1', topics: mock_topics}, 
    {name: 'Unit 2', topics: mock_topics},
    {name: 'Unit 3', topics: mock_topics},
];

export const TopicsTab: React.FC<TopicsTabProps> = () => {
    return (
        <>
            {mock_units.map((unit, i) => (
                <div key={i}>
                    <h2>{unit.name}</h2>
                    <TopicsList listOfTopics={unit.topics} />
                </div>
            )
            )}
        </>
    );
};

export default TopicsTab;