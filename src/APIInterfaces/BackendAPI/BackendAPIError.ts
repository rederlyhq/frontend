import _ from 'lodash';
import { AxiosError } from 'axios';

// https://www.reddit.com/r/typescript/comments/f91zlt/how_do_i_check_that_a_caught_error_matches_a/
export function isAxiosError(error: any): error is AxiosError {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (error as AxiosError).isAxiosError !== undefined;
}

export default class BackendAPIError<T = unknown> extends Error {
    public name: string;
    public originalError: any;
    public data?: T;

    get axiosError(): AxiosError | null {
        if (isAxiosError(this.originalError)) {
            return this.originalError;
        }
        return null;
    }

    get status(): number | undefined {
        return this.axiosError?.response?.status;
    }

    constructor(e: any) {
        // This should be constructed from the error in a catch
        // You cannot put a type annotation and anything can be be thrown

        let message: string = 'Unknown error occurred';
        if (isAxiosError(e)) {
            message = e.response?.data?.message;
            if (_.isNil(message)) {
                message = e.message;
            }
        } else if (e instanceof Error) {
            message = e.message;
        } else if (_.isNil(e)) {
            // Do nothing, keep it default
        } else {
            message = e.toString();
        }
        super(message);

        // Super needs to be called before I can call this
        if (isAxiosError(e)) {
            (this.data as any) = e.response?.data?.data;
        }
        this.originalError = e;
        this.name = 'BackendAPIError';
    }

    static isBackendAPIError(obj: unknown): obj is BackendAPIError {
        return obj instanceof BackendAPIError;
    }
}
