import _ from 'lodash';
import { AxiosError } from 'axios';

// https://www.reddit.com/r/typescript/comments/f91zlt/how_do_i_check_that_a_caught_error_matches_a/
export function isAxiosError(error: any): error is AxiosError {
    return (error as AxiosError).isAxiosError !== undefined;
}

export default class BackendAPIError extends Error {
    public name: string;
    public originalError: any;

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
        this.originalError = e;
        this.name = 'BackendAPIError';
    }
}
