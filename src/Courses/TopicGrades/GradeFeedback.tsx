import React, { useRef, useEffect } from 'react';
import ReactQuill, {Quill} from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// import 'mathquill/build/mathquill';
import { Button, Grid } from '@material-ui/core';
import mathquill4quill from 'mathquill4quill';
import 'mathquill4quill/mathquill4quill.css';
import _ from 'lodash';
import logger from '../../Utilities/Logger';

import '../../Components/Quill/QuillOverrides.css';

// Load Katex with this module
import katex from 'katex';
import 'katex/dist/katex.min.css';
import QuillControlledEditor from '../../Components/Quill/QuillControlledEditor';
import { postFeedback } from '../../APIInterfaces/BackendAPI/Requests/CourseRequests';
window.katex = katex;

interface GradeFeedbackProps {
    workbookId: number;
}

export const GradeFeedback: React.FC<GradeFeedbackProps> = ({ workbookId }) => {
    const onSave = async (content: unknown) => {
        try {
            await postFeedback({workbookId, content});
        } catch (e) {
            // TODO: Error validation to user.
            logger.error(e);
        }
    };

    return <QuillControlledEditor onSave={onSave} placeholder={'Leave feedback for this student\'s attempt'} />;
};
