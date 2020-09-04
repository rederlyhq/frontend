import React, { useEffect, useState } from 'react';
import { ProblemObject, NewCourseTopicObj, StudentGrade } from '../Courses/CourseInterfaces';
import _ from 'lodash';
import moment from 'moment';
import { OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { getUserRole, UserRole } from '../Enums/UserRole';
import { MomentReacter } from '../Components/MomentReacter';

const INFINITE_MAX_ATTEMPT_VALUE = 0;

interface ProblemDetailsProps {
    problem: ProblemObject;
    topic: NewCourseTopicObj | null;
}

export const ProblemDetails: React.FC<ProblemDetailsProps> = ({
    problem,
    topic,
}) => {
    const startDate = moment(topic?.startDate);
    const endDate = moment(topic?.endDate);
    const deadDate = moment(topic?.deadDate);
    const solutionsMoment = moment(deadDate).add(1, 'days');

    const grade: StudentGrade | undefined = problem?.grades?.[0];

    const maxAttempts = problem?.maxAttempts;
    const usedAttempts = grade?.numAttempts;

    return (
        <div>
            <div className="d-flex">
                <h2>{topic?.name}</h2>
                <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props: any) => (
                        <Tooltip id="dates-tooltip" {...props}>
                            <strong>Started</strong> on {startDate.format('LLLL')} <br />
                            <strong>Due</strong> on {endDate.format('LLLL')} <br />
                            <MomentReacter
                                significantMoments={[endDate, deadDate]}
                                stopMoment={deadDate}
                            >
                                {(currentMoment) => {
                                    if ((getUserRole() === UserRole.PROFESSOR || currentMoment.isAfter(endDate)) && !deadDate.isSame(endDate)) {
                                        return (
                                            <>
                                                <strong>Can receive partial credit</strong> until {deadDate.format('LLLL')} <br />
                                            </>
                                        );
                                    }
                                    return <></>;
                                }}
                            </MomentReacter>
                        </Tooltip>
                    )}
                >
                    <div style={{
                        marginTop: 'auto',
                        marginLeft: '8px',
                        marginBottom: '8px',
                    }}>
                        <MomentReacter
                            intervalInMillis={60000} // fromNow changes at it's most granular by the minute
                            offsetInMillis={30000} // fromNow rounds though so it changes on the 30 second of every minute
                            absolute={true} // Since it occurs on the 30th second of the minute if less than an hour
                            stopMoment={solutionsMoment} // Once solutions are available this timer means nothing
                            significantMoments={[endDate, deadDate, solutionsMoment]}
                            logTag='dueMessage'
                        >
                            {(currentMoment: moment.Moment) => {
                                let message = '';
                                if (currentMoment.isBefore(endDate)) {
                                    message = `Due ${endDate.fromNow()}`;
                                } else if (currentMoment.isBefore(deadDate)) {
                                    message = `Partial credit expires ${deadDate.fromNow()}`;
                                } else if (currentMoment.isBefore(solutionsMoment)) {
                                    message = `Solutions available ${solutionsMoment.fromNow()}`;
                                } else {
                                    message = 'Past due';
                                }
                                return (<>{message}</>);
                            }}
                        </MomentReacter>
                    </div>
                </OverlayTrigger>
                <div style={{ marginLeft: 'auto' }}>
                    <Badge pill variant="dark">
                        {problem.id}
                    </Badge>
                </div>
            </div>
            <div className="d-flex">
                <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={(props: any) => {
                        let message = null;
                        if (_.isNil(maxAttempts) || _.isNil(usedAttempts)) {
                            message = 'Students would see information about how many attempts they have used here';
                        } else if (maxAttempts > INFINITE_MAX_ATTEMPT_VALUE) {
                            message = `You have used ${usedAttempts} of ${maxAttempts} graded attempts`;
                        } else {
                            message = `You have attempted this problem ${usedAttempts} time${usedAttempts === 1 ? '' : 's'}`;
                        }
                        return (
                            <Tooltip id="attempts-tooltip" {...props}>
                                {message}
                            </Tooltip>
                        );
                    }}
                >
                    <div>
                        {(() => {
                            if (_.isNil(maxAttempts)) {
                                return null;
                            }

                            if (maxAttempts <= INFINITE_MAX_ATTEMPT_VALUE) {
                                return 'This question does not have an attempt limit.';
                            } else {
                                if (_.isNil(usedAttempts)) {
                                    return `This problem allows ${maxAttempts} attempt${maxAttempts === 1 ? '' : 's'}.`;
                                }
                                const remainingAttempts = maxAttempts - usedAttempts;
                                return `You have ${remainingAttempts} graded attempt${remainingAttempts === 1 ? '' : 's'} remaining.`;
                            }
                        })()}
                    </div>
                </OverlayTrigger>
            </div>
            <div className="d-flex">
                {(() => {
                    if (_.isNil(problem)) {
                        return null;
                    }

                    let message = null;
                    if (problem.weight > 0) {
                        // has weight (and maybe optional)
                        message = `This problem is worth ${problem.weight}${problem.optional ? ' extra credit' : ''} point${problem.weight === 1 ? '' : 's'}.`;
                    } else if (problem.optional) {
                        // optional and no weight
                        message = 'This problem is optional.';
                    }
                    return message;
                })()}
            </div>
            {_.isNil(grade) ? null : (
                <>
                    <div className="d-flex">
                        Your recorded score for this problem is {(grade.effectiveScore * 100).toFixed(1)}%.
                    </div>
                    {grade.effectiveScore === grade.overallBestScore ? null : (
                        <div className="d-flex">
                            Your best attempt for this problem is {(grade.overallBestScore * 100).toFixed(1)}%.
                        </div>
                    )}
                </>
            )}
            <div className="d-flex">
                <MomentReacter
                    significantMoments={[endDate, deadDate, solutionsMoment]}
                    stopMoment={solutionsMoment} // Once solutions are available this timer means nothing
                >
                    {(currentMoment) => {
                        if (_.isNil(grade) || _.isNil(problem)) {
                            return (<></>);
                        }

                        let message = null;
                        if (grade.overallBestScore >= 1) {
                            message = 'You have completed this problem, your attempts will not be recorded.';
                        } else if (problem.maxAttempts > 0 && grade.numAttempts >= problem.maxAttempts) {
                            message = 'You have exceeded the attempt limit. Your attempts on this problem will not be graded but will count toward completion.';
                        } else if (currentMoment.isBefore(deadDate) && currentMoment.isAfter(endDate)) {
                            message = 'The topic is past due but partial credit is available. Your attempts will be graded with a penalty.';
                        } else if (currentMoment.isAfter(solutionsMoment)) {
                            // TODO get from backend
                            message = 'Solutions are available, your attempts will not be recorded.';
                        } else if (currentMoment.isBefore(solutionsMoment) && currentMoment.isAfter(deadDate)) {
                            message = 'The topic is past due. Your attempts on this problem will not be graded but will count toward completion.';
                        } else if (grade.overallBestScore < 1 && currentMoment.isBefore(endDate) && (grade.numAttempts < problem.maxAttempts || problem.maxAttempts <= INFINITE_MAX_ATTEMPT_VALUE)) {
                            // All of these situations should already be handled, just making it more defensive
                            message = 'Your attempts on this problem will be graded.';
                        } else {
                            // TODO remote error logging
                            message = 'An unknown error has occured and it is unclear if your attempt will be graded.';
                        }
                        return (<>{message}</>);
                    }}
                </MomentReacter>
            </div>
        </div>
    );
};
