import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { ProblemObject } from '../CourseInterfaces';
import url from 'url';
import { getAllContentForVersion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../../Utilities/Logger';
import { useQuery } from '../../Hooks/UseQuery';
import './PrintEverything.css';
import { GetAllVersionAttachmentsResponse } from '../../APIInterfaces/BackendAPI/ResponseTypes/CourseResponseTypes';
import PDFInlineRender from './PDFInlineRender';

interface PrintEverythingProps {
}

export const PrintEverything: React.FC<PrintEverythingProps> = () => {
    let userId: number = 0;
    let topicId: number = 0;
    const qs = useQuery();
    const workbookName = qs.get('workbookName');
    const params = useParams<{userId?: string, topicId?: string}>();

    if (params.userId)
        userId = parseInt(params.userId, 10);

    if (params.topicId)
        topicId = parseInt(params.topicId, 10);

    const [gradeData, setGradeData] = useState<GetAllVersionAttachmentsResponse | null>(null);


    useEffect(()=>{
        if (_.isNil(userId) || _.isNil(topicId)) {
            logger.error(`Got to page without User ${userId} or Topic ${topicId}`);
            return;
        }
        (async () => {
            const res = await getAllContentForVersion({userId, topicId});
            setGradeData(res.data.data);

            // TODO: pdf.js in the embeds warns that the PDF hasn't fully loaded.
            setTimeout(()=>{
                window.print();
            }, 8000);
        })();
    }, [userId, topicId]);

    if (_.isNil(gradeData)) return null;

    return (
        <>
            <h1>{gradeData.topic.name} -- {gradeData.user.firstName} {gradeData.user.lastName}</h1>
            <h2>{workbookName?.fromBase64()}</h2>
            <h3 className='dont-print'>Printing will begin in several seconds...</h3>
            {gradeData.topic.questions.map((problem)=>{
                if (problem.grades.length > 1) {
                    logger.warn('More grades were found for a problem at a specific version.');
                    return;
                }
                const bestAttemptWorkbook = problem.grades.first?.lastInfluencingCreditedAttemptId;
                const problemPath = problem.grades.first?.webworkQuestionPath;
                const attachments = problem.grades.first?.problemAttachments;

                const baseUrl = gradeData.baseUrl;
                return (
                    <div key={problem.id}>
                        <h4>Problem {problem.problemNumber}</h4>
                        <ProblemIframe
                            problem={new ProblemObject({id: problem.id, path: problemPath})}
                            workbookId={bestAttemptWorkbook}
                            readonly={true}
                        />
                        <h5>Problem {problem.problemNumber} Attachments</h5>
                        {attachments?.map((attachment) => {
                            const { cloudFilename, userLocalFilename } = attachment;
                            if (!cloudFilename) {
                                return;
                            }

                            const cloudUrl = url.resolve(baseUrl.toString(), cloudFilename);

                            if (userLocalFilename.indexOf('.pdf') >= 0) {
                                return <PDFInlineRender key={cloudFilename} url={cloudUrl} />;
                            }

                            return (
                                <embed
                                    key={cloudFilename}
                                    title={cloudFilename}
                                    src={cloudUrl}
                                    style={{maxWidth: '100%'}}
                                />
                            );
                        })
                        }
                    </div>
                );
            })}
        </>
    );
};

export default PrintEverything;