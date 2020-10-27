import { Drawer, Grid } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';
import { TopicObject } from '../Courses/CourseInterfaces';
import { FaFileUpload } from 'react-icons/fa';

interface AttachmentsSidebarProps {
    topic: TopicObject;
    openDrawer: boolean;
    setOpenDrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AttachmentsSidebar: React.FC<AttachmentsSidebarProps> = ({topic, openDrawer, setOpenDrawer}) => {
    const [attachedFiles, setAttachedFiles] = useState<any[]>([]);

    useEffect(()=>{
        // Get list of attached files.
        const res: any[] = [];
        setAttachedFiles(res);
    }, [topic]);
    
    const onDrop: <T extends File>(acceptedFiles: T[], fileRejections: FileRejection[], event: DropEvent) => void = useCallback(
        (acceptedFiles, fileRejections) => {
            (async () => {
                try {
                    console.log(acceptedFiles);
                    console.log(fileRejections);
                // TODO: Post get signed url to backend
                // TODO: Post upload work to AWS
                // TODO: Post confirmed upload to backend
                } catch (e) {
                    console.error(e);
                }
            })();
        }, []);
    
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
                    </div>
                    <input type="file" {...getInputProps()} />
                    <div 
                        className='text-center' 
                        style={{position: 'relative', margin: '0 auto', top: '30%', fontSize: '1.3em'}}
                    >
                        Drop your files to add them to your workbook!
                        <FaFileUpload 
                            style={{position: 'relative', margin: '0 auto', top: '30%', display: 'block', fontSize: '2em'}}
                            onClick={open}    
                        />
                    </div>
                    {attachedFiles.map((file: any, i: number) => {
                        return (
                            <div key={i}>
                                {i}
                            </div>
                        );
                    })}
                </Grid>
            </Grid>
        </Drawer>
    );
};

export default AttachmentsSidebar;