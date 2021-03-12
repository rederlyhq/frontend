import { Drawer, Grid } from '@material-ui/core';
import { Button } from 'react-bootstrap';
import React, { useCallback, useEffect, useState } from 'react';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import { ProblemAttachments, TopicObject } from '../Courses/CourseInterfaces';
import { FaFileUpload } from 'react-icons/fa';
import { getAttachments, deleteAttachments } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import logger from '../Utilities/Logger';
import _ from 'lodash';
import AttachmentsSidebarItem from './AttachmentsSidebarItem';

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
                        {attachedFiles.map((attachment: ProblemAttachments, i: number) => 
                            <AttachmentsSidebarItem
                                key={attachment.key} 
                                baseUrl={baseUrl} 
                                attachment={attachment} 
                                deleteAttachment={deleteAttachment}
                                i={i}
                                gradeIds={{
                                    gradeId: gradeId,
                                    gradeInstanceId: gradeInstanceId,
                                    workbookId: undefined,
                                }}
                            />)}
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