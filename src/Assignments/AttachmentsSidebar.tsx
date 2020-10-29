import { Card, CardContent, Drawer, Grid, LinearProgress } from '@material-ui/core';
import { Button } from 'react-bootstrap';
import React, { useCallback, useEffect, useState } from 'react';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import { TopicObject } from '../Courses/CourseInterfaces';
import { FaFileUpload } from 'react-icons/fa';
import { BsFileEarmarkMinus } from 'react-icons/bs';
import { MdError } from 'react-icons/md';
import { getUploadURL, postConfirmAttachmentUpload } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../Utilities/Logger';
import _ from 'lodash';
import { putUploadWork } from '../APIInterfaces/AWS/Requests/StudentUpload';

interface AttachmentsSidebarProps {
    topic: TopicObject;
    openDrawer: boolean;
    setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>;
    // Technically, a grade or gradeInstance id.
    gradeId?: number;
    gradeInstanceId?: number;
}

export const AttachmentsSidebar: React.FC<AttachmentsSidebarProps> = ({topic, openDrawer, setOpenDrawer, gradeId, gradeInstanceId}) => {
    const [attachedFiles, setAttachedFiles] = useState<Array<{file: File, progress: number}>>([]);

    // TODO: Get list of attached files.
    useEffect(()=>{
        const res: any[] = [];
        setAttachedFiles(res.map(file => ({file: file, progress: 100})));
    }, [topic]);

    const updateIndexProgressWithOffset = (index: number, value: number, offset: number) => {
        setAttachedFiles(attachedFiles => {
            if (index >= attachedFiles.length) {
                return attachedFiles;
            }

            const localAttachedFiles = [...attachedFiles];
            localAttachedFiles[index] = {...attachedFiles[index], progress: offset + value};
            return localAttachedFiles;
        });
    };

    const updateIndexProgress = (index: number, progressEvent: any) => {
        setAttachedFiles(attachedFiles => {
            if (index >= attachedFiles.length) {
                console.error('Attempted to update progress beyond array bounds.', index);
                return attachedFiles;
            }
            const progressPercent = Math.round((progressEvent.loaded / progressEvent.total) * 70);
            const localAttachedFiles = [...attachedFiles];
            localAttachedFiles[index] = {...attachedFiles[index], progress: 10 + progressPercent};
            return localAttachedFiles;
        });
    };

    const uploadFilesWIthProgress = async (attachedFiles: Array<{file: File, progress: number}>) => {
        try {
            attachedFiles.forEach(async (file, index) => {
                // Skip in-progress files.
                if (file.progress > 0) return;
                try {
                    const onUploadProgress = _.partial(updateIndexProgress, index);
                    const res = await getUploadURL();
                    logger.debug(res);
                    updateIndexProgressWithOffset(index, 20, 0);
                    
                    await putUploadWork({
                        presignedUrl: res.data.data.uploadURL,
                        file: file.file, 
                        onUploadProgress: onUploadProgress
                    });

                    await postConfirmAttachmentUpload({
                        attachment: {
                            cloudFileName: res.data.data.cloudFilename,
                            userLocalFilename: file.file.name,
                        },
                        studentGradeId: gradeId,
                        studentGradeInstanceId: gradeInstanceId,
                    });

                    updateIndexProgressWithOffset(index, 10, 90);
                } catch (e) {
                    // Catch on an individual file basis
                    updateIndexProgressWithOffset(index, -1, 0);
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    const onDrop: <T extends File>(acceptedFiles: T[], fileRejections: FileRejection[], event: DropEvent) => void = useCallback(
        (acceptedFiles, fileRejections) => {
            const processingFiles = acceptedFiles.map(file => ({file: file, progress: 0}));
            setAttachedFiles(attachedFiles => {
                const fullAttachedState = [...attachedFiles, ...processingFiles];
                uploadFilesWIthProgress(fullAttachedState);
                return fullAttachedState;
            });
        }, [attachedFiles]);
    
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop,
        accept: ['.png', '.jpg', '.pdf', '.jpeg'],
        noClick: true,
        noKeyboard: true
    });

    return (
        <Drawer 
            {...getRootProps()}
            anchor={'right'} 
            open={openDrawer} 
            onClose={()=>setOpenDrawer(false)}
            SlideProps={{style: {width: '30rem'}}}
        >
            <Grid container md={12} style={isDragActive ? {
                position: 'absolute', 
                width: '100%', 
                height: '100%', 
                border: '5px dashed lightblue', 
                borderRadius: '3px',
                textAlign: 'center',
                backgroundColor: '#343a40',
                opacity: 0.9
            } : {}}>
                <Grid item md={12}>
                    <div className='text-center'>
                        <h1>Attachments</h1>
                        <p>Drag and drop files to upload your work for this problem.</p>
                    </div>
                    <input type="file" {...getInputProps()} />
                    <Grid>
                        {attachedFiles.map((fileAndProgress: {file: File, progress: number}, i: number) => {
                            const isInError = fileAndProgress.progress < 0;
                            const errorStyle = {
                                color: 'red',
                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                            };
                            return (
                                <Card key={fileAndProgress.file.name} style={isInError ? errorStyle : {}}>
                                    <CardContent>
                                        {isInError ? <MdError /> : <BsFileEarmarkMinus />} {fileAndProgress.file.name}
                                        {fileAndProgress.progress < 100 && 
                                            <LinearProgress variant="determinate" value={fileAndProgress.progress} />}
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