import { AxiosResponse } from 'axios';
import libraryBrowserAxios from './LibraryBrowserAxios';
import BackendAPIError from '../BackendAPI/BackendAPIError';
import { BackendAPIResponse } from '../BackendAPI/BackendAPIResponse';

const SUBJECTS_ROUTE = '/subjects';
const CHAPTERS_ROUTE = '/chapters';
const SECTIONS_ROUTE = '/sections';
const SEARCH_ROUTE = '/search';

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

export const getSubjects = async (): Promise<AxiosResponse<unknown>> => {
    try {
        return await libraryBrowserAxios.get(SUBJECTS_ROUTE);
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getChapters = async (options?: GetChaptersOptions): Promise<AxiosResponse<unknown>> => {
    try {
        return await libraryBrowserAxios.get(CHAPTERS_ROUTE, {
            params: options?.params
        });
    } catch (e) {
        throw new BackendAPIError(e);
    }
};

export const getSections = async (options?: GetSectionsOptions): Promise<AxiosResponse<unknown>> => {
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
