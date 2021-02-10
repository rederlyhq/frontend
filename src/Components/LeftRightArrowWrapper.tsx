import _ from 'lodash';
import React from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import logger from '../Utilities/Logger';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import './LeftRightArrow.css';

// I would've liked to make this generic, but it's not in our usual paradigm.
// https://wanago.io/2020/03/09/functional-react-components-with-generic-props-in-typescript/
interface LeftRightArrowWrapperProps {
    list: Record<number, ProblemObject>;
    selected: number | null;
    setSelected: React.Dispatch<React.SetStateAction<number | null>>;
}


export const LeftRightArrowWrapper: React.FC<LeftRightArrowWrapperProps> = ({ list, setSelected, selected, children }) => {

    if (_.isNil(selected)) return null;

    // This specialized wrap only works for our Record/problemNumber structure.
    const wrap = (size: number, n: number) => {
        if (n < 1) return size;
        else if (n > size) return 1;
        else return n;
    };

    const length = Object.keys(list).length;

    const setNewSelected = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, incr: 1 | -1) => {
        const currProb = list[selected];
        const newProbNumber = wrap(length, currProb.problemNumber + incr);
        const newProb = _.find(list, ['problemNumber', newProbNumber]);

        if (_.isNil(newProb)) {
            logger.warn(`${incr} button could not find a problem to go to.`);
            return;
        }

        setSelected(newProb?.id);
        if (e.target instanceof HTMLElement) {
            e.target.blur();
        }
    };

    return <>
        <button className='left-right-btn left-right-btn-left' onClick={(e)=>setNewSelected(e, -1)}>
            <ArrowBackIosIcon />
        </button>
        <div style={{width: '90%', display: 'inline-block', margin: '0px 3.5%'}}>
            {children}
        </div>
        <button className='left-right-btn left-right-btn-right' onClick={(e)=>setNewSelected(e, 1)}>
            <ArrowForwardIosIcon />
        </button>
    </>;
};
