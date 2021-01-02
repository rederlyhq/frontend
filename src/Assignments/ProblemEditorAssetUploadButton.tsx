import React, { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { Box, TextField, Button, InputAdornment } from '@material-ui/core';
// import { Button } from 'react-bootstrap';
import _ from 'lodash';
import { useDropzone } from 'react-dropzone';
import { FaFileUpload } from 'react-icons/fa';
import { Modal } from 'react-bootstrap';
import logger from '../Utilities/Logger';
import { uploadAsset } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';

type ProblemEditorAssetUploadButtonEvent = {
    status: 'success';
    data: any;
} | {
    status: 'error';
    data: Error;
} | {
    status: 'loading';
    data: null;
}

interface ProblemEditorAssetUploadButtonProps {
    defaultDirectory: string;
    sandboxPath: string;
    onEvent?: (event: ProblemEditorAssetUploadButtonEvent) => void;
}

export const ProblemEditorAssetUploadButton: React.FC<ProblemEditorAssetUploadButtonProps> = ({
    defaultDirectory,
    sandboxPath,
    onEvent
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [relativePath, setRelativePath] = useState<string>(defaultDirectory);

    useEffect(() => {
        setRelativePath(`${defaultDirectory === '.' ? '' : `${defaultDirectory}/`}${file?.name ?? ''}`);
    }, [defaultDirectory, setRelativePath, file?.name]);

    const onDrop = useCallback((acceptedFiles: Array<File>) => {
        if (_.isNil(acceptedFiles.first)) {
            return;
        }

        setFile(acceptedFiles.first);
    }, [setFile]);

    const onHide = useCallback(() => setFile(null), [setFile]);
    const onSubmit = useCallback(async () => {
        try {
            if (_.isNil(file)) {
                throw new Error('File cannot be null');
            }
            onEvent?.({
                status: 'loading',
                data: null
            });
            const result = await uploadAsset({
                file: file,
                relativePath: relativePath
            });
            logger.info(JSON.stringify({
                fileName: file.name,
                relativePath: relativePath
            }));
            logger.info(result.data.data);
            onEvent?.({
                status: 'success',
                data: result.data.data
            });
        } catch (e) {
            logger.error(e);
            onEvent?.({
                status: 'error',
                data: e
            });
        }
        onHide();
    }, [file, relativePath]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDrop,
        multiple: true
    });

    return (
        <>
            <div
                style={{
                    position: 'relative',
                    height: '100%'
                }}
                {...getRootProps()}
            >
                <Button
                    fullWidth={true}
                    variant="outlined"
                    style={{
                        height: '100%'
                    }}
                >
                    Upload PG Asset
                </Button>
                {isDragActive && (
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        border: '5px dashed lightblue',
                        borderRadius: '3px',
                        textAlign: 'center',
                        zIndex: 2,
                        backgroundColor: 'white',
                        opacity: 0.9,
                    }}
                    >
                        <div style={{ position: 'relative', margin: '0 auto', top: '15%', fontSize: '1em' }}>
                            <FaFileUpload style={{ position: 'relative', margin: '0 auto', top: '15%', display: 'block', fontSize: '1em' }} />
                        </div>
                    </div>
                )}
                <input {...getInputProps()} />
            </div>
            <Modal
                show={!_.isNil(file)}
                onHide={onHide}
                dialogClassName="modal-90w"
            >
                <Modal.Header>
                    Upload PG File Asset
                </Modal.Header>
                <Modal.Body>
                    <Box>
                        <Box
                            display="flex"
                            flexWrap="nowrap"
                            p={1}
                            m={1}
                        >
                            <Box
                                p={1}
                                flexGrow={1}
                            >
                                <TextField
                                    aria-label="Upload file name"
                                    label='Upload file name'
                                    variant='outlined'
                                    type='text'
                                    value={file?.name ?? ''}
                                    disabled={true}
                                    fullWidth={true}
                                />
                            </Box>
                            {/* This: {...getRootProps()} causes the first button to flicker, need to investigate further */}
                            {/* <Box
                                p={1}
                            >
                                <div
                                    style={{
                                        position: 'relative',
                                        height: '100%'
                                    }}
                                    {...getRootProps()}
                                >
                                    <Button
                                        variant="outlined"
                                        style={{
                                            height: '100%'
                                        }}
                                    >
                                        Change PG Asset
                                    </Button>
                                    {isDragActive && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            right: 0,
                                            bottom: 0,
                                            border: '5px dashed lightblue',
                                            borderRadius: '3px',
                                            textAlign: 'center',
                                            zIndex: 2,
                                            backgroundColor: 'white',
                                            opacity: 0.9,
                                        }}
                                        >
                                            <div style={{ position: 'relative', margin: '0 auto', top: '15%', fontSize: '1em' }}>
                                                <FaFileUpload style={{ position: 'relative', margin: '0 auto', top: '15%', display: 'block', fontSize: '1em' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Box> */}
                        </Box>
                        <Box
                            p={1}
                            m={1}
                        >
                            <Box
                                p={1}
                                flexGrow={1}
                            >
                                {/* The sandbox path ends in a "/" */}
                                <TextField
                                    onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>setRelativePath(event.target.value)}
                                    label='Target Path'
                                    type='text'
                                    variant="outlined"
                                    fullWidth={true}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">{sandboxPath}</InputAdornment>,
                                    }}
                                    value={relativePath}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="secondary" onClick={onHide}>Cancel</Button>
                    <Button color="primary" onClick={onSubmit}>Submit</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
