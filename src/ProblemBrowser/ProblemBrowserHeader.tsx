import React from 'react';
import { ProblemBrowserSearchType, ProblemBrowserDataCourseMeta, ProblemBrowserData, ProblemBrowserDataLibraryMeta } from './ProblemBrowserTypes';
import logger from '../Utilities/Logger';


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

export const ProblemBrowserBrowserLibraryHeader: React.FC<ProblemBrowserDataLibraryMeta> = ({
    subjectName,
    chapterName,
    sectionName,
}) => {
    return (<div>
        <p><strong>Subject:</strong> {subjectName}</p>
        <p><strong>Chapter:</strong> {chapterName}</p>
        <p><strong>Section:</strong> {sectionName}</p>
    </div>);
};

export const ProblemBrowserHeader: React.FC<ProblemBrowserData> = ({
    path,
    meta
}) => {

    const getSpecificHeader = () => {
        switch (meta.type) {
        case ProblemBrowserSearchType.LIBRARY: return <ProblemBrowserBrowserLibraryHeader {...meta} />;
        case ProblemBrowserSearchType.COURSE: return <ProblemBrowserBrowserCourseHeader {...meta} />;
        case ProblemBrowserSearchType.PRIVATE: return <></>; // There is no header here yet
        default:
            logger.warn(`ProblemBrowserHeader: invalid type ${(meta as any).type}`); 
            return <></>;
        }
    };

    return <div style={{
        padding: '0.5em'
    }}>
        {getSpecificHeader()}
        <strong>Problem Path:</strong> {path}
    </div>;
};
