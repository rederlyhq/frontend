import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { ProblemObject, TopicObject } from '../CourseInterfaces';
import logger from '../../Utilities/Logger';
import { usePrintLoadingContext, PrintLoadingActions } from '../../Contexts/PrintLoadingContext';
import OnLoadProblemIframeWrapper from './OnLoadProblemIframeWrapper';
import { Alert } from '@material-ui/lab';
import { useCourseContext } from '../CourseProvider';
import useQuerystringHelper from '../../Hooks/useQuerystringHelper';

import './Bootstrap2.3.2Overrides.css';
import './PrintEverything.css';
interface PrintBlankTopicProps {
}

export const PrintBlankTopic: React.FC<PrintBlankTopicProps> = () => {
    const [gradeData, setGradeData] = useState<TopicObject | null>(null);
    const {dispatch} = usePrintLoadingContext();
    const params = useParams<{topicId?: string}>();
    const {course} = useCourseContext();
    const {getCurrentQueryStrings} = useQuerystringHelper();

    let topicId: number | null = null;
    if (params.topicId)
        topicId = parseInt(params.topicId, 10);

    // Rename the title to provide a default filename in some OSes.
    useEffect(()=>{
        if (_.isNil(gradeData)) return;

        document.title = `${gradeData?.name} - Rederly Worksheet`;
        
        // Reset title if leaving the page.
        return () => {
            document.title = 'Rederly';
        };
    }, [gradeData]);

    useEffect(()=>{
        if (_.isNil(topicId) || _.isNaN(topicId)) {
            logger.error(`Attempting to print a page without Topic ${topicId} in the URL.`);
            return;
        }

        const topic = course.findTopic(topicId);

        if (_.isNil(topic)) {
            logger.error(`Printing page could not find topic ${topicId} in course ${course.id}`);
        }

        setGradeData(topic ?? null);
    }, [course, topicId]);

    if (_.isNil(gradeData)) return null;

    logger.debug('A rerender happened, so resetting expected count and reiniting promises.');
    dispatch?.({type: PrintLoadingActions.RESET_EXPECTED_COUNT});
    const expectedProblemIframes = gradeData?.questions.length ?? 0;

    logger.info(
        `Adding expectation for ${expectedProblemIframes} Problem iFrames`
    );

    // The reset assumes that we're making an asynchronous call to get these promises, so it starts with an expectation of 1.
    // To account for this unhelpful assumption, we can decrement the expectation count here.
    dispatch?.({type: PrintLoadingActions.ADD_EXPECTED_PROMISE_COUNT, expected: expectedProblemIframes - 1});

    return (
        <>
            <h1>{gradeData.name} Worksheet</h1>
            <Alert severity='info' className='dont-print'>Printing will begin after all problems and attachments have finished loading. If the print dialog does not appear after the page has finished loading, you can <button onClick={()=>window.print()} className='link-button'>click here</button>.</Alert>
            <Alert severity='warning' className='dont-print'>Some browsers have trouble printing embedded images, even if they render on-screen. If the print preview does not include images, try using <a href='https://www.google.com/chrome/' target='_blank' rel='noreferrer'>Google Chrome</a>.</Alert>
            <br/>
            {gradeData.questions.map((problem)=>{
                const problemPath = problem.webworkQuestionPath;
                const firstRandomSeed = gradeData.isExam() ? problem.courseQuestionAssessmentInfo?.randomSeedSet?.first : 1;

                return (
                    <div key={problem.id} className='blankTopicIframe'>
                        <h4>Problem {problem.problemNumber}</h4>
                        <OnLoadProblemIframeWrapper>
                            <ProblemIframe
                                problem={new ProblemObject({id: problem.id, path: problemPath})}
                                previewPath={problemPath}
                                previewSeed={firstRandomSeed ?? 1}
                                readonly={true}
                                previewShowSolutions={getCurrentQueryStrings()?.showSolutions === 'true'}
                            />
                        </OnLoadProblemIframeWrapper>
                    </div>
                );
            })}
        </>
    );
};

export default PrintBlankTopic;
