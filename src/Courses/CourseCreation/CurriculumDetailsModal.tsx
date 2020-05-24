import React from 'react';
import LoginButtonAndModal from '../../Components/ButtonAndModal';

interface CurriculumDetailsModalProps {
    title: string;
    desc: string;
    [x: string]: any;
}

export const CurriculumDetailsModal: React.FC<CurriculumDetailsModalProps> = ({title, desc, ...props}) => {
    return (
        <LoginButtonAndModal header={title} buttonText='See Details' {...props}>
            {desc}
        </LoginButtonAndModal>
    );
};

export default CurriculumDetailsModal;