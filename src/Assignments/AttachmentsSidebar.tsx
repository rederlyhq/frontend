import { Card, CardContent, Drawer, Grid, IconButton, LinearProgress } from '@material-ui/core';
import { Button } from 'react-bootstrap';
import React, { useCallback, useEffect, useState } from 'react';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import { ProblemAttachments, TopicObject } from '../Courses/CourseInterfaces';
import { FaFileUpload } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import { DeleteOutlined } from '@material-ui/icons';
import { getUploadURL, postConfirmAttachmentUpload, getAttachments, deleteAttachments } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../Utilities/Logger';
import _ from 'lodash';
import { putUploadWork } from '../APIInterfaces/AWS/Requests/StudentUpload';
import url from 'url';

import './AttachmentsSidebar.css';

interface AttachmentsSidebarProps {
    topic: TopicObject;
    openDrawer: boolean;
    setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>;
    // Technically, a grade or gradeInstance id.
    gradeId?: number;
    gradeInstanceId?: number;
}

export const AttachmentsSidebar: React.FC<AttachmentsSidebarProps> = ({topic, openDrawer, setOpenDrawer, gradeId, gradeInstanceId}) => {
    const [attachedFiles, setAttachedFiles] = useState<Array<ProblemAttachments>>([]);
    const [baseUrl, setBaseUrl] = useState<string>(window.location.host);

    // Get list of attached files.
    useEffect(()=>{
        (async () => {
            try {
                const res = await getAttachments({ 
                    studentGradeId: gradeId, 
                    studentGradeInstanceId: gradeInstanceId,
                });

                const alreadyAttachedFiles = res.data.data.attachments;
                const baseUrl = res.data.data.baseUrl;

                setBaseUrl(baseUrl);
                setAttachedFiles(alreadyAttachedFiles.map(file => new ProblemAttachments(file)));
            } catch (e) {
                logger.error('Failed to get attachments.', e);
            }
        })();
    }, [topic, gradeId, gradeInstanceId]);

    // Whenever the length changes, rerun uploads for everything in state.
    // If delete, everything should have progress 100.
    useEffect(() => {
        uploadFilesWithProgress();
    }, [attachedFiles.length]);

    const updateIndexProgressWithPartial = (index: number, partial: Partial<ProblemAttachments>) => {
        setAttachedFiles(attachedFiles => {
            if (index >= attachedFiles.length) {
                return attachedFiles;
            }

            const localAttachedFiles = [...attachedFiles];
            localAttachedFiles[index] = {...attachedFiles[index], ...partial};
            return localAttachedFiles;
        });
    };

    const updateIndexProgress = (index: number, progressEvent: any) => {
        setAttachedFiles(attachedFiles => {
            if (index >= attachedFiles.length) {
                logger.error('Attempted to update progress beyond array bounds. (TSNH)', index);
                return attachedFiles;
            }
            const progressPercent = Math.round((progressEvent.loaded / progressEvent.total) * 70);
            const localAttachedFiles = [...attachedFiles];
            localAttachedFiles[index] = new ProblemAttachments({...attachedFiles[index], progress: 10 + progressPercent});
            return localAttachedFiles;
        });
    };

    const uploadFilesWithProgress = async () => {
        attachedFiles.forEach(async (file, index) => {
            // Skip in-progress files or files that failed to upload correctly..
            if (file.progress > 0 || _.isNil(file.file)) return;

            try {
                const onUploadProgress = _.partial(updateIndexProgress, index);
                const res = await getUploadURL();

                updateIndexProgressWithPartial(index, {progress: 10});
                    
                await putUploadWork({
                    presignedUrl: res.data.data.uploadURL,
                    file: file.file, 
                    onUploadProgress: onUploadProgress
                });

                const confirmRes = await postConfirmAttachmentUpload({
                    attachment: {
                        cloudFilename: res.data.data.cloudFilename,
                        userLocalFilename: file.file.name,
                    },
                    ...(gradeInstanceId ?
                        {studentGradeInstanceId: gradeInstanceId} :
                        {studentGradeId: gradeId}
                    ),
                });
                const attachmentData = confirmRes.data.data;
                updateIndexProgressWithPartial(index, {...attachmentData, progress: 100, cloudFilename: res.data.data.cloudFilename});
            } catch (e) {
                // Catch on an individual file basis
                updateIndexProgressWithPartial(index, {progress: -1});
                logger.error('A user encountered an error during attachment upload.', e.message);
            }
        });
    };

    const onDrop: <T extends File>(acceptedFiles: T[], fileRejections: FileRejection[], event: DropEvent) => void = useCallback(
        // TODO: Nicer UI for file rejections.
        (acceptedFiles, /*fileRejections*/) => {
            const processingFiles = acceptedFiles.map(file => new ProblemAttachments({file: file}));
            const fullAttachedState = [...attachedFiles, ...processingFiles];
            setAttachedFiles(fullAttachedState);
        }, [attachedFiles]);
    
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop,
        accept: [
            'image/*',
            'application/pdf',
            // Fallback, if MIME-type detection fails.
            '.heic',
            '.png',
            '.jpeg',
        ],
        noClick: true,
        noKeyboard: true
    });

    const deleteAttachment = async (attachment: ProblemAttachments) => {
        if (_.isNil(attachment.id)) {
            logger.error('Attempted to delete attachment with no id. Was it uploaded successfully?');
            return;
        }
        try {
            await deleteAttachments({id: attachment.id});
            setAttachedFiles(attachedFiles => _.reject(attachedFiles, ['id', attachment.id]));
        } catch (e) {
            logger.error('Failed to delete an attachment.', e.message);
        }
    };

    return (
        <Drawer 
            {...getRootProps()}
            anchor={'right'} 
            open={openDrawer} 
            onClose={()=>setOpenDrawer(false)}
            SlideProps={{style: {width: '30rem'}}}
        >
            {isDragActive && (
                <div style={{
                    position: 'absolute', 
                    width: '100%', 
                    height: '100%', 
                    border: '5px dashed lightblue', 
                    borderRadius: '3px',
                    textAlign: 'center',
                    zIndex: 2,
                    backgroundColor: 'white',
                    opacity: 0.9
                }} 
                >
                    <div style={{position: 'relative', margin: '0 auto', top: '30%', fontSize: '1.3em'}}>
                        Drop your attachments here to upload your work!
                        <FaFileUpload style={{position: 'relative', margin: '0 auto', top: '30%', display: 'block', fontSize: '2em'}}/>
                    </div>
                </div>
            )}
            <Grid container md={12}>
                <Grid item md={12}>
                    <div className='text-center'>
                        <h1>Attachments</h1>
                        <p>Drag and drop files to upload your work for this problem.</p>
                    </div>
                    <input type="file" {...getInputProps()} />
                    <Grid style={{
                        height: '83vh',
                        overflowY: 'auto',
                    }}>
                        {attachedFiles.map((attachment: ProblemAttachments, i: number) => {
                            const isInError = attachment.progress < 0;
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
                                attachment.file && attachment.progress >= 100 ? successStyle : {}
                            );

                            return (
                                <Card key={attachment.file?.name ?? attachment.id} style={cardStyle}>
                                    <CardContent>
                                        {isInError && <MdError />} {attachment.file?.name ?? attachment.userLocalFilename}
                                        <IconButton color="secondary" aria-label="delete" onClick={()=>deleteAttachment(attachment)} style={{float: 'right'}} disabled={attachment.progress < 100}>
                                            <DeleteOutlined />
                                        </IconButton>

                                        <a href={(baseUrl && attachment.cloudFilename) ? url.resolve(baseUrl.toString(), attachment.cloudFilename) : '/404'} target="_blank" rel='noopener noreferrer'>
                                            <IconButton color="primary" aria-label="preview" style={{float: 'right'}}>
                                                <BsBoxArrowUpRight />
                                            </IconButton>
                                        </a>

                                        {attachment.file && <LinearProgress variant="determinate" value={attachment.progress} />}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Grid>
                    <div
                        style={{position: 'absolute', width: '100%', margin: '0 auto', bottom: '0px', fontSize: '2em'}}
                    >
                        <Button 
                            block
                            className='text-center' 
                            onClick={open}
                        >
                            <FaFileUpload
                                style={{margin: '0 auto', fontSize: '2em'}}
                            />
                            Upload
                        </Button>
                    </div>
                </Grid>
            </Grid>
        </Drawer>
    );
};

export default AttachmentsSidebar;