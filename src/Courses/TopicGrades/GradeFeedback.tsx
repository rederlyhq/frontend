import React, { useEffect } from 'react';
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
import { useForm, Controller } from 'react-hook-form';
window.katex = katex;

interface GradeFeedbackProps {
    workbookId?: number;
    topicId: number;
    userId: number;
    defaultValue?: any;
    setGradeAlert: React.Dispatch<React.SetStateAction<IMUIAlertModalState>>;
}

export const GradeFeedback: React.FC<GradeFeedbackProps> = ({ workbookId, setGradeAlert, defaultValue, userId, topicId }) => {
    const { control, handleSubmit, formState, reset } = useForm<{feedback: unknown}>({
        mode: 'onSubmit',
        defaultValues: {
            feedback: defaultValue,
        },
    });

    useEffect(()=>{
        reset({feedback: defaultValue ?? null});
    }, [reset, defaultValue, workbookId, topicId, userId]);

    const onSave = async (feedbackObject: {feedback: unknown}) => {
        const content = feedbackObject.feedback;
        try {
            if (workbookId) {
                await postFeedback({workbookId, content});
            } else {
                await postTopicFeedback({topicId, userId, content});
            }
            reset(feedbackObject);
        } catch (e) {
            logger.error(e);
            setGradeAlert({message: `An error occurred while saving your feedback. (${e.message})`, severity: 'error'});
        }
    };

    const uploadConfirmation = async ({attachment}: GenericConfirmAttachmentUploadOptions) => {
        if (workbookId) {
            await postGenericConfirmAttachmentUpload({
                type: AttachmentType.WORKBOOK_FEEDBACK,
                attachment,
                workbookId,
            });
        } else {
            await postGenericConfirmAttachmentUpload({
                type: AttachmentType.TOPIC_FEEDBACK,
                attachment,
                topicId,
                userId,
            });
        }
    };

    console.log(formState.isDirty);

    return <form onSubmit={handleSubmit(onSave)}>
        <Controller
            name={'feedback'}
            control={control}
            defaultValue={{feedback: defaultValue}}
            render={({ onChange, onBlur, value }) => (
                <QuillControlledEditor
                    onBlur={onBlur}
                    onChange={onChange}
                    value={value}
                    // key={JSON.stringify({workbookId, topicId, userId})}
                    // onSave={onSave} 
                    placeholder={`Leave feedback for this student's attempt. 
Students can see this by visiting their version of the grading page and selecting this attempt.
You may drag and drop files to upload them here.
                    `} 
                    defaultValue={defaultValue}
                    attachmentType={AttachmentType.WORKBOOK_FEEDBACK}
                    uploadConfirmation={uploadConfirmation}
                    isDirty={formState.isDirty}
                    isNestedInForm
                />
            )}
        />
    </form>;
};
