import React, {  } from 'react';
import 'react-quill/dist/quill.snow.css';
// import 'mathquill/build/mathquill';
import 'mathquill4quill/mathquill4quill.css';
import logger from '../../Utilities/Logger';

import '../../Components/Quill/QuillOverrides.css';

// Load Katex with this module
import katex from 'katex';
import 'katex/dist/katex.min.css';
import QuillControlledEditor from '../../Components/Quill/QuillControlledEditor';
import { postFeedback, postGenericConfirmAttachmentUpload, postTopicFeedback } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
import { IMUIAlertModalState } from '../../Hooks/useAlertState';
import AttachmentType from '../../Enums/AttachmentTypeEnum';
import { GenericConfirmAttachmentUploadOptions } from '../../APIInterfaces/BackendAPI/RequestTypes/CourseRequestTypes';
window.katex = katex;

interface GradeFeedbackProps {
    workbookId?: number;
    topicId: number;
    userId: number;
    defaultValue?: any;
    setGradeAlert: React.Dispatch<React.SetStateAction<IMUIAlertModalState>>;
}

export const GradeFeedback: React.FC<GradeFeedbackProps> = ({ workbookId, setGradeAlert, defaultValue, userId, topicId }) => {
    const onSave = async (content: unknown) => {
        try {
            if (workbookId) {
                await postFeedback({workbookId, content});
            } else {
                await postTopicFeedback({topicId, userId, content});
            }
        } catch (e) {
            logger.error(e);
            setGradeAlert({message: `An error occurred while saving your feedback. (${e.message})`, severity: 'error'});
        }
    };

    const uploadConfirmation = ({attachment}: GenericConfirmAttachmentUploadOptions) => {
        if (workbookId) {
            postGenericConfirmAttachmentUpload({
                type: AttachmentType.WORKBOOK_FEEDBACK,
                attachment,
                workbookId,
            });
        } else {
            postGenericConfirmAttachmentUpload({
                type: AttachmentType.TOPIC_FEEDBACK,
                attachment,
                topicId,
                userId,
            });
        }
        
    };

    return <QuillControlledEditor 
        // This is a quick hack to reload the editor if the default value changes take precedence.
        key={JSON.stringify(defaultValue)}
        onSave={onSave} 
        placeholder={`Leave feedback for this student's attempt. 
Students can see this by visiting their version of the grading page and selecting this attempt.
You may drag and drop files to upload them here.
        `} 
        defaultValue={defaultValue}
        attachmentType={AttachmentType.WORKBOOK_FEEDBACK}
        uploadConfirmation={uploadConfirmation}
    />;
};
