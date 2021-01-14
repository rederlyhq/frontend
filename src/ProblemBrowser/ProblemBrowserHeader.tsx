import React from 'react';
import { ProblemBrowserSearchType, ProblemBrowserDataCourseMeta, ProblemBrowserData } from './ProblemBrowserTypes';


export const ProblemBrowserBrowserCourseHeader: React.FC<ProblemBrowserDataCourseMeta> = ({
    courseName,
    topicName,
    unitName
}) => {
    return (<div>
        <p><strong>Course:</strong> {courseName}</p>
        <p><strong>Unit:</strong> {unitName}</p>
        <p><strong>Topic: </strong> {topicName}</p>
    </div>);
};

export const ProblemBrowserHeader: React.FC<ProblemBrowserData> = ({
    path,
    meta
}) => {

    const getSpecificHeader = () => {
        switch (meta.type) {
        case ProblemBrowserSearchType.LIBRARY: return <div>TODO</div>;
        case ProblemBrowserSearchType.COURSE: return <ProblemBrowserBrowserCourseHeader {...meta} />;
        case ProblemBrowserSearchType.PRIVATE: return <div>TODO</div>;
        default: return <div>ERROR</div>;
        }
    };

    return <div>
        {getSpecificHeader()}
        <strong>Problem Path:</strong> {path}
    </div>;
};
