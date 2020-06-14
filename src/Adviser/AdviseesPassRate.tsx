import React from 'react';
import { Doughnut } from 'react-chartjs-2';

interface AdviseesPassRateProps {
data: any
options: any
}

export const AdviseesPassRate: React.FC<AdviseesPassRateProps> = ({data, options}) => {
    return (
        <Doughnut data={data} options={options}/>
    );
};

export default AdviseesPassRate;