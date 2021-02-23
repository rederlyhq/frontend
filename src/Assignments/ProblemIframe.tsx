import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import _ from 'lodash';
import { Alert } from 'react-bootstrap';
import { postQuestionSubmission, putQuestionGrade, putQuestionGradeInstance, postPreviewQuestion, getQuestion } from '../APIInterfaces/BackendAPI/Requests/CourseRequests';
import moment from 'moment';
import { useCurrentProblemState } from '../Contexts/CurrentProblemState';
import logger from '../Utilities/Logger';
import BackendAPIError from '../APIInterfaces/BackendAPI/BackendAPIError';
import useAlertState from '../Hooks/useAlertState';
import { RendererIFrame } from './RendererIFrame';
import { formDataToObject } from '../Utilities/FormHelper';
import { Constants } from '../Utilities/Constants';

interface ProblemIframeProps {
    problem: ProblemObject;
    setProblemStudentGrade?: (id: number, val: any) => void;
    previewPath?: string;
    previewSeed?: number;
    previewProblemSource?: string;
    previewShowHints?: boolean;
    previewShowSolutions?: boolean;
    workbookId?: number;
    readonly?: boolean;
    userId?: number;
    studentTopicAssessmentInfoId?: number;
    propagateLoading?: (loading: boolean)=>void;
    // This was added for professors printing versions with/without exams.
    showCorrectAnswers?: boolean;
}

interface PendingRequest {
    cancelled?: boolean;
    problemId?: number;
    workbookId?: number;
}

/**
 * The most important part- rendering the problem.
 * We used the document.write strategy before for backwards compatibility, but modern browsers now block it.
 * We _could_ also set the form to just render the URL directly from the server, but this provides more flexibility
 * with further work on the JSON data.
 * Important reference: https://medium.com/the-thinkmill/how-to-safely-inject-html-in-react-using-an-iframe-adc775d458bc
 */
export const ProblemIframe: React.FC<ProblemIframeProps> = ({
    problem,
    previewPath,
    previewSeed,
    previewProblemSource,
    previewShowHints,
    previewShowSolutions,
    setProblemStudentGrade = Constants.React.defaultStates.NOOP_FUNCTION,
    workbookId,
    readonly = false,
    userId,
    studentTopicAssessmentInfoId,
    propagateLoading,
    showCorrectAnswers
}) => {
    const pendingReq = useRef<PendingRequest | null>(null);
    const [renderedHTML, setRenderedHTML] = useState<string>(Constants.React.defaultStates.EMPTY_STRING);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useAlertState();
    const [lastSubmission, setLastSubmission] = useState(Constants.React.defaultStates.EMPTY_OBJECT);

    const { setLastSavedAt, setLastSubmittedAt } = useCurrentProblemState();

    // Propagates loading states to parent listeners.
    useEffect(()=>{
        propagateLoading?.(loading);
    }, [loading, propagateLoading]);

    const getHTML = useCallback(async () => {
        logger.debug('ProblemIframe: Getting new renderedHTML.');
        try {
            let res;

            if (previewPath || previewProblemSource) {
                res = await postPreviewQuestion({
                    webworkQuestionPath: previewPath,
                    problemSeed: previewSeed,
                    problemSource: previewProblemSource,
                    showHints: previewShowHints,
                    showSolutions: previewShowSolutions
                });
            } else {
                res = await getQuestion({
                    id: problem.id,
                    userId,
                    workbookId,
                    studentTopicAssessmentInfoId,
                    readonly,
                    showCorrectAnswers
                });
            }
            return res.data.data.rendererData.renderedHTML as string;

        } catch (e) {
            setAlert({
                variant: 'danger',
                message: e.message
            });
            if (!BackendAPIError.isBackendAPIError(e) || (e.status !== 200 && e.status !== 400)) {
                logger.error(`An error occurred with retrieving ${(previewPath || previewProblemSource) ? 'a preview' : 'a problem'}. ${e.message}`);
            }

            setLoading(false);
        }
    }, [previewPath, previewProblemSource, previewSeed, previewShowHints, previewShowSolutions, problem.id, readonly, setAlert, studentTopicAssessmentInfoId, userId, workbookId]);

    const fetchHTML = useCallback(async () => {
        if (pendingReq.current !== null) {
            logger.debug(`Problem Iframe: Canceling request for problem #${pendingReq.current.problemId} workbook #${pendingReq.current.workbookId}`);
            pendingReq.current.cancelled = true;
        }
        const currentReq = {problemId: problem.id, workbookId} as PendingRequest;
        pendingReq.current = currentReq;

        const rendererHTML = await getHTML();

        if (currentReq.cancelled) {
            logger.debug(`Problem Iframe: The request for problem #${problem.id} and workbook #${workbookId} was cancelled early.`);
            return;
        } else if (!_.isNil(rendererHTML)) {
            pendingReq.current = null;
            // We need to reset the error state since a new call means no error
            setAlert({
                variant: 'info',
                message: Constants.React.defaultStates.EMPTY_STRING
            });
            setRenderedHTML(rendererHTML);
        }
    }, [getHTML, problem.id, setAlert, workbookId]);

    useEffect(()=>{
        // If you don't reset the rendered html you won't get the load event
        // Thus if you go to an error state and back to the success state
        // The rendered html will never call load handler which will never stop loading
        setRenderedHTML(Constants.React.defaultStates.EMPTY_STRING);
        // srcdoc='' triggers onLoad with setLoading(false) so setLoading(true) isn't effective until now
        setLoading(true);

        fetchHTML();

        // when problem changes, reset lastsubmitted and lastsaved
        setLastSubmittedAt?.(null);
        setLastSavedAt?.(null);
        setLastSubmission(Constants.React.defaultStates.EMPTY_OBJECT);
    }, [fetchHTML, setLastSavedAt, setLastSubmittedAt, problem.grades?.first?.randomSeed]);

    const isPrevious = (_value: any, key: string): boolean => {
        return /^previous_/.test(key);
    };

    const updateSubmitActive = _.throttle((problemForm: HTMLFormElement, submitButtons: NodeListOf<HTMLButtonElement>) => {
        // called only onLoad or after interaction with already loaded srcdoc - so form will exist, unless bad problemPath
        // no logger.error because exam problems (and static problems) will not have 'submitAnswers'
        if (_.isNil(submitButtons) || _.isNil(problemForm)) {return;}

        const currentState = _.omitBy(formDataToObject(new FormData(problemForm)), isPrevious);
        const previousState = _.omitBy(lastSubmission, isPrevious);
        const isClean = _.isEqual(currentState, previousState);

        submitButtons.forEach((button: HTMLButtonElement) => {
            const valueStashAttributeName = 'value-stash';
            const valueStashAttributeContents = button.getAttribute(valueStashAttributeName);
            const valueContents = button.getAttribute('value');
            if (isClean) {
                if (!button.disabled) {
                    button.setAttribute('disabled','true');
                    // invisibly stash the button's label (in case there are multiple submit buttons)
                    if (valueContents){
                        button.setAttribute(valueStashAttributeName, valueContents);
                        button.setAttribute('value', 'Submitted');
                    } else {
                        logger.error('Inconceivable! Submit button has no value contents.');
                    }
                }
            } else {
                if (button.disabled) {
                    button.removeAttribute('disabled');
                    if (valueStashAttributeContents) {
                        // put it back and clear the stash - just in case
                        button.setAttribute('value', valueStashAttributeContents);
                        button.removeAttribute(valueStashAttributeName);
                    }
                }
            }
        });
    }, 100, {leading:true, trailing:true});

    const prepareAndSubmit = useCallback(async function prepareAndSubmit(problemForm: HTMLFormElement, clickedButton?: HTMLButtonElement) {
        // check that the submit url is accurate
        const submitUrl = problemForm.getAttribute('action');
        const checkId = submitUrl?.match(/\/backend-api\/courses\/question\/([0-9]+)\?/);
        if (checkId && parseInt(checkId[1],10) !== problem.id) {
            // if this still happens, we have bigger problems
            logger.error(`Something went wrong. Problem #${problem.id} is rendering a form with url: ${submitUrl}`);
            setAlert({
                variant: 'danger',
                message: `This problem ID (${problem.id}) is out of sync.`
            });
        }

        const submitAction = (window as any).submitAction;
        if(typeof submitAction === 'function') submitAction(); // this is a global function from renderer - prepares form field for submit

        const formData = new FormData(problemForm);
        if (!_.isNil(clickedButton)) {
            // current state will never match submission unless we save it before including clickedButton
            // but we only want to save the current state if the button was 'submitAnswers'
            const saveMeLater = formDataToObject(formData);
            formData.set(clickedButton.name, clickedButton.value);
            try {
                let result: any;
                setLoading(true);
                setRenderedHTML('');
                if (_.isNil(previewPath) && _.isNil(previewProblemSource)) {
                    result = await postQuestionSubmission({
                        id: problem.id,
                        data: formData,
                    });
                } else {
                    result = await postPreviewQuestion({
                        webworkQuestionPath: previewPath,
                        problemSeed: previewSeed,
                        formData,
                        problemSource: previewProblemSource,
                        showHints: previewShowHints,
                        showSolutions: previewShowSolutions
                    });
                }

                if (clickedButton.name === 'submitAnswers'){
                    setProblemStudentGrade(problem.id, result.data.data.studentGrade);
                    setLastSubmission(saveMeLater);
                    setLastSubmittedAt?.(moment());
                }
                setRenderedHTML(result.data.data.rendererData.renderedHTML);
            } catch (e) {
                setAlert({
                    variant: 'danger',
                    message: e.message
                });
                return;
            }
        } else {
            if (_.isNil(problem.grades)) {return;} // TODO: impossi-log logger.error()
            if (_.isNil(problem.grades[0])) {return;} // not enrolled - do not save
            if (_.isNil(problem.grades[0].id)) {
                // TODO: impossi-log logger.error()
                setAlert({
                    variant: 'danger',
                    message: `No grade id found for this problem #${problem.id}`
                });
                return;
            }
            const reqBody = {
                currentProblemState: _.omit(formDataToObject(formData), 'answersSubmitted')
            };

            try {
                const result = (_.isNil(problem.grades[0].gradeInstances) || problem.grades[0].gradeInstances.length === 0) ?
                    await putQuestionGrade({
                        id: problem.grades[0].id,
                        data: reqBody
                    }) :
                    await putQuestionGradeInstance({
                        id: problem.grades[0].gradeInstances[0].id,
                        data: reqBody
                    });

                if (result.data.data.updatesCount > 0) {
                    setProblemStudentGrade(problem.id, {...problem.grades[0], hasBeenSaved: true});
                    setLastSavedAt?.(moment());
                }
            } catch (e) {
                setAlert({
                    variant: 'danger',
                    message: e.message
                });
                return;
            }
        }
    }, [previewPath, previewProblemSource, previewSeed, previewShowHints, previewShowSolutions, problem.grades, problem.id, setAlert, setLastSavedAt, setLastSubmittedAt, setProblemStudentGrade]);

    const debouncedSaveHandler = useMemo(() => _.debounce(prepareAndSubmit, 2000, { leading: false, trailing: true }), [prepareAndSubmit]);
    const debouncedSubmitHandler = useMemo(() => _.debounce(prepareAndSubmit, 300, { leading: false, trailing: true }), [prepareAndSubmit]);


    return (
        <>
            <Alert variant={alert.variant} show={Boolean(alert.message)}>{alert.message} -- Please refresh your page.</Alert>
            <RendererIFrame
                renderedHTML={renderedHTML}
                loading={loading}
                onLoad={(loadedRenderedHTML: string) => {
                    setRenderedHTML(renderedHTML => {
                        if(loadedRenderedHTML === renderedHTML) {
                            setLoading(false);
                        }
                        return renderedHTML;
                    });
                }}
                shouldStopLoading={() => {
                    if (!_.isNull(pendingReq.current)) {
                        logger.debug('onLoadHandlers bowing out since another request is in progress');
                        return true;
                    }
                    return false;
                }}
                changeHandler={(initialLoad: boolean, problemForm: HTMLFormElement, submitButtons: NodeListOf<HTMLButtonElement>) => {
                    // updating submit button is throttled - so don't worry onInput spam
                    updateSubmitActive(problemForm, submitButtons);
                    if (!initialLoad) {
                        // we don't want to save while edits are in progress, so debounce
                        debouncedSaveHandler(problemForm);
                    }
                }}
                submitHandler={debouncedSubmitHandler}
                useReadonlyHeight={readonly}
            />
        </>
    );
};

export default ProblemIframe;
