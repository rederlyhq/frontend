import { AxiosResponse } from 'axios';
import libraryBrowserAxios from './LibraryBrowserAxios';
import BackendAPIError from '../BackendAPI/BackendAPIError';
import { BackendAPIResponse } from '../BackendAPI/BackendAPIResponse';

const SUBJECTS_ROUTE = '/subjects';
const CHAPTERS_ROUTE = '/chapters';
const SECTIONS_ROUTE = '/sections';
const SEARCH_ROUTE = '/search';

/**
 * ############### ###############
 * ########### Options ###########
 * ############### ###############
 */
interface GetChaptersOptions {
    params?: {
        subjectId?: number;
    }
}

interface GetSectionsOptions {
    params?: {
        chapterId?: number;
    }
}

interface GetSearchOptions {
    params?: {
        subjectId?: number;
        chapterId?: number;
        sectionId?: number;
    }
}

/**
 * ############### ###############
 * ############ Types ############
 * ############### ###############
 */
export interface OPL_DBSubject {
    dbsubject_id: number;
    name: string;
}

export interface OPL_DBChapter {
    dbsubject_id: number;
    name: string;
    dbchapter_id: number;
}

export interface OPL_DBSection {
    dbchapter_id: number;
    name: string;
    dbsection_id: number;
}

/**
 * ############### ###############
 * ########## Responses ##########
 * ############### ###############
 */
interface GetSubjectsResponse {
    subjects: Array<OPL_DBSubject>;
}

interface GetChaptersResponse {
    chapters: Array<OPL_DBChapter>;
}

interface GetSectionsResponse {
    sections: Array<OPL_DBSection>;
}

export const getSubjects = async (): Promise<AxiosResponse<BackendAPIResponse<GetSubjectsResponse>>> => {
    try {
        return await libraryBrowserAxios.get(SUBJECTS_ROUTE);
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getChapters = async (options?: GetChaptersOptions): Promise<AxiosResponse<BackendAPIResponse<GetChaptersResponse>>> => {
    try {
        return await libraryBrowserAxios.get(CHAPTERS_ROUTE, {
            params: options?.params
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getSections = async (options?: GetSectionsOptions): Promise<AxiosResponse<BackendAPIResponse<GetSectionsResponse>>> => {
    try {
        return await libraryBrowserAxios.get(SECTIONS_ROUTE, {
            params: options?.params
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getSearch = async (options?: GetSearchOptions): Promise<AxiosResponse<unknown>> => {
    try {
        return await libraryBrowserAxios.get(SEARCH_ROUTE, {
            params: options?.params
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};
