import React from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

interface ProblemSetListProps {
problems: Array<ProblemObject>;
}

export const ProblemSetList: React.FC<ProblemSetListProps> = ({problems}) => {
    return (
        <ListGroup>
            {problems.map(problem => (
                <ListGroupItem key={problem.problemNumber}>
                    {problem.webworkQuestionPath}
                </ListGroupItem>
            ))}
        </ListGroup>
    );
};

export default ProblemSetList;