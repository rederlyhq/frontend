import React, { useState, useReducer, useEffect, useCallback } from 'react';
import _ from 'lodash';
import logger from '../Utilities/Logger';
import { Card } from 'react-bootstrap';
import { CardContent, IconButton, LinearProgress } from '@material-ui/core';
import { MdError } from 'react-icons/md';
import { DeleteOutlined } from '@material-ui/icons';
import url from 'url';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import { ProblemAttachments } from '../Courses/CourseInterfaces';
import { getUploadURL, postConfirmAttachmentUpload } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { putUploadWork } from '../APIInterfaces/AWS/Requests/StudentUpload';

interface AttachmentsSidebarItemProps {
    attachment: ProblemAttachments;
    i: number;
    deleteAttachment: (attachment: ProblemAttachments)=>void;
    baseUrl: string;
    gradeIds: {
        gradeInstanceId?: number;
        gradeId?: number;
        workbookId?: number;
    }
}

type ProgressPayloadedActions = {
    type: 'INCREMENT' | 'SET_TO';
    payload: number;
}

type ProgressErrorAction = {
    type: 'ERROR';
}

type UpdateProgressAction = ProgressPayloadedActions | ProgressErrorAction;

type ProgressReducer = (state: number | null, action: UpdateProgressAction) => number | null;

const reducer: ProgressReducer = (state, action) => {
    switch (action.type) {
    case 'INCREMENT':
        state = state ?? 0;
        return state + action.payload;
    case 'SET_TO':
        if (state && action.payload < state) {
            logger.warn(`Attempted to update backwards from ${state} to ${action.payload}`);
        }
        return action.payload;
    case 'ERROR':
        return null;
    default:
        logger.error('Unknown action:', action);
        return state;
    }
};

/**
 * VARIANTS:
 *  1. attachment.key === attachment.id and attachment.file === null means this is an existing attachment and the progress indicator is unnecessary.
 *  2. attachment.key !== attachment.id and progress >= 0 means this is a new attachment and progress is shown on the indicator.
 *  3. attachment.key !== attachment.id and progress === null means this is a new attachment and it failed to upload.
 */
export const AttachmentsSidebarItem: React.FC<AttachmentsSidebarItemProps> = ({ attachment, i, deleteAttachment, baseUrl, gradeIds }) => {
    const [progress, setProgress] = useReducer<ProgressReducer>(reducer, null);
    const [cloudUrl, setCloudUrl] = useState<string | null>(url.resolve(baseUrl, attachment.cloudFilename ?? '404'));

    const uploadFilesWithProgress = useCallback(async () => {
        // Skip in-progress files or files that failed to upload correctly..
        if (_.isNil(attachment.file)) {
            logger.error(`Upload was called and file is ${attachment.file}`);
            return;
        }

        try {
            setProgress({type: 'SET_TO', payload: 5});
            const res = await getUploadURL();

            // TODO: Remove in next release!
            logger.debug(`Got Upload URL: ${res.data.data.uploadURL} for index ${i}`);
                
            setProgress({type: 'SET_TO', payload: 10});
                
            await putUploadWork({
                presignedUrl: res.data.data.uploadURL,
                file: attachment.file,
                onUploadProgress: (progressEvent: ProgressEvent) => setProgress({type: 'SET_TO', payload: 10 + Math.round((progressEvent.loaded / progressEvent.total) * 70)})
            });

            const confirmRes = await postConfirmAttachmentUpload({
                attachment: {
                    cloudFilename: res.data.data.cloudFilename,
                    userLocalFilename: attachment.file.name,
                },
                ...(gradeIds.gradeInstanceId ?
                    {studentGradeInstanceId: gradeIds.gradeInstanceId} :
                    {studentGradeId: gradeIds.gradeId}
                ),
            });
            // TODO: Fix typing on this.
            const attachmentData = confirmRes.data.data;

            // TODO: Persist this back up
            Object.assign(attachment, attachmentData);
            delete attachment.file;
            setCloudUrl(attachmentData.cloudFilename);
            setProgress({type: 'SET_TO', payload: 100});
        } catch (e) {
            // Catch on an individual file basis
            setProgress({type: 'ERROR'});
            logger.error('A user encountered an error during attachment upload.', e.message);
        }
    }, [attachment, gradeIds.gradeId, gradeIds.gradeInstanceId, i]);

    useEffect(()=>{
        if (!_.isNil(attachment.file)) {
            uploadFilesWithProgress();
        }
    }, [attachment.file, uploadFilesWithProgress]);

    const isInError = _.isNil(progress);
    const errorStyle = {
        color: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
    };
    const successStyle = {
        color: 'green',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
    };

    if (_.isNil(attachment.file) && _.isNil(attachment.id)) {
        logger.error('An Attachment in state has neither file nor id. (TSNH).');
        return (
            <Card key={`error-${i}`} style={errorStyle}>
                <CardContent>
                    There was an error loading this attachment.
                </CardContent>
            </Card>
        );
    }

    const cardStyle = isInError ? errorStyle : (
        attachment.file && progress && progress >= 100 ? successStyle : {}
    );

    return (
        <Card key={attachment.file?.name ?? attachment.id} style={cardStyle}>
            <CardContent>
                {isInError && <MdError />} {attachment.file?.name ?? attachment.userLocalFilename}
                <IconButton color="secondary" aria-label="delete" onClick={()=>deleteAttachment(attachment)} style={{float: 'right'}} disabled={!progress || progress < 100}>
                    <DeleteOutlined />
                </IconButton>

                <a href={(baseUrl && cloudUrl) ? url.resolve(baseUrl.toString(), cloudUrl) : '/404'} target="_blank" rel='noopener noreferrer'>
                    <IconButton color="primary" aria-label="preview" style={{float: 'right'}}>
                        <BsBoxArrowUpRight />
                    </IconButton>
                </a>

                {(attachment.file || attachment.key !== attachment.id) && <LinearProgress variant="determinate" value={progress ?? 0} />}
            </CardContent>
        </Card>
    );
};

export default AttachmentsSidebarItem;