import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { ProblemObject } from '../CourseInterfaces';
import url from 'url';
import { getAllContentForVersion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../../Utilities/Logger';
import { GetAllVersionAttachmentsResponse } from '../../APIInterfaces/BackendAPI/ResponseTypes/CourseResponseTypes';
import PDFInlineRender from './PDFInlineRender';
import { usePrintLoadingContext, PrintLoadingActions } from '../../Contexts/PrintLoadingContext';
import OnLoadDispatchWrapper from './onLoadDispatchWrapper';
import OnLoadProblemIframeWrapper from './OnLoadProblemIframeWrapper';
import Heic from '../../Components/Heic';
import { Alert } from '@material-ui/lab';
import useQuerystringHelper from '../../Hooks/useQuerystringHelper';

import './Bootstrap2.3.2Overrides.css';
import './PrintEverything.css';
interface PrintEverythingProps {
}

export const PrintEverything: React.FC<PrintEverythingProps> = () => {
    const [gradeData, setGradeData] = useState<GetAllVersionAttachmentsResponse | null>(null);
    const {dispatch} = usePrintLoadingContext();
    const params = useParams<{userId?: string, topicId?: string}>();
    const {getCurrentQueryStrings} = useQuerystringHelper();

    let userId: number | null = null;
    let topicId: number | null = null;
    if (params.userId)
        userId = parseInt(params.userId, 10);

    if (params.topicId)
        topicId = parseInt(params.topicId, 10);

    // Rename the title to provide a default filename in some OSes.
    useEffect(()=>{
        if (_.isNil(gradeData)) return;

        document.title = `Rederly ${gradeData.topic.name} ${gradeData.user.lastName} ${gradeData.user.firstName}`;
        
        // Reset title if leaving the page.
        return () => {
            document.title = 'Rederly';
        };
    }, [gradeData]);

    useEffect(()=>{
        if (_.isNil(userId) || _.isNil(topicId) || _.isNaN(userId) || _.isNaN(topicId)) {
            logger.error(`Attempting to print a page without User ${userId} or Topic ${topicId} in the URL.`);
            return;
        }

        if (_.isNil(dispatch)) {
            logger.warning('Needs to rerender, dispatch has not been initialized.');
            return;
        }

        dispatch?.({type: PrintLoadingActions.RESET_EXPECTED_COUNT});

        const gettingData = (async () => {
            const res = await getAllContentForVersion({userId, topicId});

            const expectedProblemIframes = res.data.data.topic.questions.length;
            const expectedAttachments = _.reduce(res.data.data.topic.questions, (accum, problem) => {
                return problem.grades.first?.problemAttachments ? accum + problem.grades.first?.problemAttachments.length : 0;
            }, 0);

            logger.info(
                `Adding expectation for ${expectedProblemIframes} Problem iFrames and ${expectedAttachments} attachments (imgs + whole pdfs)`
            );
            dispatch?.({type: PrintLoadingActions.ADD_EXPECTED_PROMISE_COUNT, expected: expectedAttachments + expectedProblemIframes});

            setGradeData(res.data.data);
        })();

        // This promise is already expected in the context. Should I add an explicit dispatch for it?
        logger.info('Adding default promise for starting workflow.');
        dispatch?.({type: PrintLoadingActions.ADD_PROMISE, payload: gettingData});

    }, [userId, topicId]);

    if (_.isNil(gradeData)) return null;

    return (
        <>
            <h1>{gradeData.topic.name} -- {gradeData.user.firstName} {gradeData.user.lastName}</h1>
            <Alert severity='info' className='dont-print'>Printing will begin after all problems and attachments have finished loading. If the print dialog does not appear after the page has finished loading, you can <button onClick={()=>window.print()} className='link-button'>click here</button>.</Alert>
            <Alert severity='warning' className='dont-print'>Some browsers have trouble printing embedded images, even if they render on-screen. If the print preview does not include images, try using <Link to='https://www.google.com/chrome/'>Google Chrome</Link>.</Alert>
            <br/>
            {gradeData.topic.questions.map((problem)=>{
                if (problem.grades.length > 1) {
                    logger.warn('More grades were found for a problem at a specific version.');
                    return null;
                }
                const bestAttemptWorkbook = problem.grades.first?.lastInfluencingCreditedAttemptId ?? problem.grades.first?.lastInfluencingAttemptId;
                const problemPath = problem.grades.first?.webworkQuestionPath;
                const attachments = problem.grades.first?.problemAttachments;
                const baseUrl = gradeData.baseUrl;

                return (
                    <div key={problem.id}>
                        <h4>Problem {problem.problemNumber}</h4>
                        <OnLoadProblemIframeWrapper>
                            <ProblemIframe
                                problem={new ProblemObject({id: problem.id, path: problemPath})}
                                workbookId={bestAttemptWorkbook}
                                readonly={true}
                                showCorrectAnswers={getCurrentQueryStrings()?.showSolutions === 'true'}
                            />
                        </OnLoadProblemIframeWrapper>
                        {attachments && attachments.length > 0 ? <h5>Problem {problem.problemNumber} Attachments</h5> : <h5>Problem {problem.problemNumber} has no attachments</h5>}
                        {attachments?.map((attachment) => {
                            const { cloudFilename, userLocalFilename, updatedAt } = attachment;
                            if (!cloudFilename) {
                                logger.error('No cloud filename was found for an attachment. TSNH.');
                                return null;
                            }
                            const cloudUrl = url.resolve(baseUrl.toString(), cloudFilename);
                            const timestamp = `${userLocalFilename} was uploaded on ${updatedAt.toMoment().formattedMonthDateTime()}`;

                            if (_.endsWith(userLocalFilename.toLowerCase(), '.heic') || _.endsWith(userLocalFilename.toLowerCase(), '.heif')) {
                                return (
                                    <>
                                        {timestamp}
                                        <OnLoadDispatchWrapper
                                            key={cloudFilename}
                                        >
                                            <Heic                                            
                                                title={cloudFilename ?? 'No Filename'}
                                                url={cloudUrl} 
                                            />
                                        </OnLoadDispatchWrapper>
                                    </>
                                );
                            }

                            if (_.endsWith(userLocalFilename, '.pdf')) {
                                return <>
                                    {timestamp}
                                    <PDFInlineRender key={cloudFilename} url={cloudUrl} />
                                </>;
                            }

                            return (
                                <>
                                    {timestamp}
                                    <OnLoadDispatchWrapper
                                        key={cloudFilename}
                                    >
                                        <img
                                            alt={userLocalFilename}
                                            src={cloudUrl}
                                            style={{maxWidth: '100%'}}
                                        />
                                    </OnLoadDispatchWrapper>
                                </>
                            );

                            /* We currently only support images and PDFs. */
                            // return (
                            //     <embed
                            //         key={cloudFilename}
                            //         title={cloudFilename}
                            //         src={cloudUrl}
                            //         style={{maxWidth: '100%'}}
                            //     />
                            // );
                        })
                        }
                    </div>
                );
            })}
        </>
    );
};

export default PrintEverything;