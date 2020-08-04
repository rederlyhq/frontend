import React, { useRef, useEffect, useState } from 'react';
import { ProblemObject } from '../Courses/CourseInterfaces';
import AxiosRequest from '../Hooks/AxiosRequest';
import { fromEvent } from 'from-form-submit';
import _ from 'lodash';
import { Spinner, Button } from 'react-bootstrap';
import { ProblemDoneState } from '../Enums/AssignmentEnums';

interface GetUploadProps {
    problem: ProblemObject;
}

/**
 * The most important part- rendering the problem.
 * We used the document.write strategy before for backwards compatibility, but modern browsers now block it.
 * We _could_ also set the form to just render the URL directly from the server, but this provides more flexibility
 * with further work on the JSON data.
 * Important reference: https://medium.com/the-thinkmill/how-to-safely-inject-html-in-react-using-an-iframe-adc775d458bc
 */
export const GetUpload: React.FC<GetUploadProps> = ({problem}) => {
    const [{path, pathError}, setVerifyState] = useState({path: '', pathError: ''});
        
            (async () => {
            try {
                const res = await AxiosRequest.get('/student-work/get-path', {
                    params: {
                      problemId: problem.id
                    }
                  });
                  console.log(res.data.data.data)
                  setVerifyState({path: res.data.data.data, pathError: ''});
            } catch (e) {
                setVerifyState({pathError: 'No Path', path: 'None'});
            }
        })();


    return (
        <>
            <Button>{path}</Button>
        </>
    );
};

export default GetUpload;
