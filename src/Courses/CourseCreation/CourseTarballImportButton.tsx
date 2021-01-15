import React, { useCallback } from 'react';
// import { Button } from  '@material-ui/core';
import { Button } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import _ from 'lodash';
import { FaArchive, FaFileUpload } from 'react-icons/fa';
import logger from '../../Utilities/Logger';
import { postImportCourseArchive } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { UnitObject } from '../CourseInterfaces';

type CourseTarballImportButtonState = {
    status: 'success';
    data: UnitObject;
    warnings: {
        missingPGFileErrors: Array<string>;
        missingAssetFileErrors: Array<string>;
    }
} | {
    status: 'error';
    data: Error;
} | {
    status: 'loading';
    data: null;
}

interface CourseTarballImportButtonProps {
    style?: React.CSSProperties;
    courseId: number;
    onEvent?: (event: CourseTarballImportButtonState) => void;
}

export const CourseTarballImportButton: React.FC<CourseTarballImportButtonProps> = ({
    style,
    courseId,
    onEvent
}) => {

    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        (async () => {
            if (acceptedFiles.length > 1) {
                logger.warn('CourseTarballImportButton: onDrop: received more than one file in drop handler');
            }
            if (_.isNil(acceptedFiles.first)) {
                // TODO error handling
                // this happens when dropping multiple files or dropping files of the wrong type
                logger.error('An error with drop occurred');
                onEvent?.({
                    status: 'error',
                    data: new Error('Did not receive any valid files to upload'),
                });
            } else {
                onEvent?.({
                    status: 'loading',
                    data: null,
                });
                try {
                    const resp = await postImportCourseArchive({
                        courseId: courseId,
                        archiveFile: acceptedFiles.first
                    });
                    onEvent?.({
                        status: 'success',
                        data: new UnitObject(resp.data.data.unit),
                        warnings: resp.data.data.missingFileErrors
                    });

                } catch(e) {
                    onEvent?.({
                        status: 'error',
                        data: e,
                    });
                }
            }
            logger.info(`acceptedFiles ${acceptedFiles}`);
            logger.info(`fileRejections ${fileRejections}`);
        })();
    }, [onEvent]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDrop,
        accept: [
            '.tgz',
            '.tar.gz',
            '.tar',
            // I don't like including .gz
            // but browsers like IE and safari don't accept the double extension
            // for .tar.gz
            '.gz',
        ],
        multiple: false
    });

    return (
        <Button variant='outline-secondary'
            tabIndex={0}
            style={{
                position: 'relative',
                ...style
            }}
            {...getRootProps()}
        >
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
                        {/* Drop your archive file to import! */}
                        <FaFileUpload style={{ position: 'relative', margin: '0 auto', top: '15%', display: 'block', fontSize: '1em' }} />
                    </div>
                </div>
            )}
            <input {...getInputProps()} />
            <FaArchive /> Import Archive
        </Button>
    );
};
