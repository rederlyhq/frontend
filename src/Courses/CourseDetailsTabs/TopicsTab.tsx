import React from 'react';
import TopicsList from '../TopicsList';

interface TopicsTabProps {

}

const mock_topics = [
    {topic_name: 'addition', topic_id: 1},
    {topic_name: 'subtraction', topic_id: 2},
    {topic_name: 'multiplication', topic_id: 3},
    {topic_name: 'english', topic_id: 4}
];
const mock_units = [
    {name: 'Unit 1', topics: mock_topics, unit_id: 1}, 
    {name: 'Unit 2', topics: mock_topics, unit_id: 2},
    {name: 'Unit 3', topics: mock_topics, unit_id: 3},
];

export const TopicsTab: React.FC<TopicsTabProps> = () => {
    return (
        <>
            {mock_units.map(unit => (
                <div key={unit.unit_id}>
                    <h2>{unit.name}</h2>
                    <TopicsList listOfTopics={unit.topics} />
                </div>
            )
            )}
        </>
    );
};

export default TopicsTab;