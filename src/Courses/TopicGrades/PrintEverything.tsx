import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProblemIframe from '../../Assignments/ProblemIframe';
import { ProblemAttachments, ProblemObject } from '../CourseInterfaces';
import url from 'url';
import { getAllContentForVersion } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../../Utilities/Logger';

import './PrintEverything.css';

interface PrintEverythingProps {
    gradeId?: number;
}

export const PrintEverything: React.FC<PrintEverythingProps> = ({gradeId}) => {
    const params = useParams<{gradeId?: string}>();
    if (params.gradeId)
        gradeId = parseInt(params.gradeId, 10);
    const [gradeData, setGradeData] = useState<any>();


    useEffect(()=>{
        if (_.isNil(gradeId)) {
            logger.debug('Grade ID is null.');
            return;
        }
        (async () => {
            const res = await getAllContentForVersion({gradeInstanceId: gradeId});
            setGradeData(res.data.data);

            setTimeout(()=>{
                window.print();
            }, 5000);
        })();
    }, [gradeId]);

    if (_.isNil(gradeData)) return null;

    return (
        <>
            <h1>Grades for {gradeData[0].user.firstName} {gradeData[0].user.lastName}</h1>
            <h2 className='dont-print'>Printing will begin in several seconds...</h2>
            {gradeData.map((problem: any)=>{
                const bestAttempt = problem.bestVersionAttempt;
                const attachments = problem.studentGradeInstanceProblemAttachments;
                // TODO: Get from call
                const baseUrl = 'https://staging.rederly.com/work/';
                return (
                    <div key={problem.id} >
                        <ProblemIframe 
                            problem={new ProblemObject({id: bestAttempt.courseWWTopicQuestionId})}
                            workbookId={bestAttempt.id}
                            readonly={true}
                        />
                        {attachments.map((y: any) => {
                            const attachment = y.problemAttachment;
                            const cloudFilename = attachment.cloudFilename ?? attachment.cloudF;
                            return (
                                <>
                                    <embed
                                        key={cloudFilename}
                                        title={cloudFilename}
                                        src={(baseUrl && cloudFilename) ? url.resolve(baseUrl.toString(), cloudFilename) : '/404'}
                                        style={{maxWidth: '100%'}}
                                    />
                                </>
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