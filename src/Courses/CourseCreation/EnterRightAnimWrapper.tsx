import React from 'react';
import { motion } from 'framer-motion';

interface EnterRightAnimWrapperProps {

}

export const EnterRightAnimWrapper: React.FC<EnterRightAnimWrapperProps> = ({children}) => {
    const transition = {
        duration: 1,
        ease: [0.43, 0.13, 0.23, 0.96]
    };

    const anim = {
        enter: {
            x: 1000,
            opacity: 0,
            transition
        },
        exit: {
            x: -1000,
            opacity: 0
        },
        center: {
            x: 0,
            opacity: 1
        }
    };

    return (
        <motion.div variants={anim} initial="enter" animate="center" exit="exit">
            {children}
        </motion.div>);
};

export default EnterRightAnimWrapper;