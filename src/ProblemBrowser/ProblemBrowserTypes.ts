export enum ProblemBrowserSearchType {
    LIBRARY='library',
    PRIVATE='private',
    COURSE='course',
}

export interface ProblemBrowserDataCourseMeta {
    type: ProblemBrowserSearchType.COURSE;
    courseName?: string;
    unitName?: string;
    topicName?: string;
}

export interface ProblemBrowserDataPrivateMeta {
    type: ProblemBrowserSearchType.PRIVATE;
}

export interface ProblemBrowserDataLibraryMeta {
    type: ProblemBrowserSearchType.LIBRARY;
}

export type ProblemBrowserDataMeta = ProblemBrowserDataCourseMeta | ProblemBrowserDataPrivateMeta | ProblemBrowserDataLibraryMeta;

export interface ProblemBrowserData {
    path: string;
    meta: ProblemBrowserDataMeta;
}
