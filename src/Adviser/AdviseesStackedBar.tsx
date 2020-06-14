import React from 'react';
import { Bar } from 'react-chartjs-2';

interface AdviseesStackedBarProps {
data: any;
options: any;
}

export const AdviseesStackedBar: React.FC<AdviseesStackedBarProps> = ({data, options}) => {
    return (
        <Bar data={data} options={options}/>
    );
};

export default AdviseesStackedBar;