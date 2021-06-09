import _ from 'lodash';
import React, { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FaFileUpload } from 'react-icons/fa';
import logger from '../../Utilities/Logger';
import csvtojson from 'csvtojson';
import { readFileAsText } from '../../Utilities/FileHelper';

interface BulkEnrollButtonProps {
    style?: React.CSSProperties;
    onCSVProcessed: (emails: string[]) => unknown;
    disabled?: boolean;
}

export const BulkEnrollButton: React.FC<BulkEnrollButtonProps> = ({
    style,
    onCSVProcessed,
    disabled = false
}) => {
    const onDrop = useCallback((acceptedFiles: File[], fileRejections) => {
        (async () => {
            if (acceptedFiles.length > 1) {
                logger.warn('CourseTarballImportButton: onDrop: received more than one file in drop handler');
            }
            if (_.isNil(acceptedFiles.first)) {
                // TODO error handling
                // this happens when dropping multiple files or dropping files of the wrong type
                logger.error('An error with drop occurred');
                return;
            }
            const fileContent = await readFileAsText(acceptedFiles.first);
            if (_.isNil(fileContent)) {
                logger.error('Null fileContent for bulk enroll csv');
                // TODO error handling
                return;
            }
            const users: { email?: string }[] = await csvtojson().fromString(fileContent);
            const emails = _.compact(users.map(user => user.email));
            onCSVProcessed(emails);
        })();
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onDrop,
        accept: [
            '.csv',
        ],
        multiple: false
    });
    return (
        <Button
            style={style}
            {...getRootProps()}
            disabled={disabled}
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
                        Drop your archive file to import!
                        <FaFileUpload style={{ position: 'relative', margin: '0 auto', top: '15%', display: 'block', fontSize: '1em' }} />
                    </div>
                </div>
            )}
            <input {...getInputProps()} />
            CSV Upload
        </Button>
    );
};
