import React from 'react';
import ButtonAndModal from '../../Components/ButtonAndModal';

interface CurriculumDetailsModalProps {
    title: string;
    desc: string;
    [x: string]: any;
}

export const CurriculumDetailsModal: React.FC<CurriculumDetailsModalProps> = ({title, desc, ...props}) => {
    return (
        <ButtonAndModal header={title} buttonText='See Details' {...props}>
            {desc}
        </ButtonAndModal>
    );
};

export default CurriculumDetailsModal;