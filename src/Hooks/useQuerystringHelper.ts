import { useRouteMatch } from 'react-router-dom';
import * as qs from 'querystring';
import _ from 'lodash';
import logger from '../Utilities/Logger';

export enum QueryStringMode {
    // A single value in the query string will always get overwritten
    OVERWRITE,
    // An array value will get appended, or removed if already existing.
    APPEND_OR_REMOVE,
    // If you want an array to ignore duplicate calls rather than remove them.
    APPEND_OR_IGNORE,
}

type QuerystringObject = {[key: string]: {
    val: string | null,
    mode: QueryStringMode,
}}

/**
 * This hook provides helpers to add querystrings to your URL.
 */
export const useQuerystringHelper = () => {
    const { url } = useRouteMatch();

    /* @param append -  This copies the existing query string to an object and then adds tabs on top of it.
                        This is specifically to reduce boilerplate when only updating one part of an otherwise static querystring.
                        If you only mean to append to an array, use the QueryStringMode.ARRAY instead.
    */
    const updateRoute = (tabs: QuerystringObject, append: boolean = false): void => {
        const currentQuerystrings = qs.parse(window.location.search.substring(1));

        const newQueryObject: qs.ParsedUrlQuery = append ? currentQuerystrings : {};

        _.forOwn(tabs, ({val, mode}: {val: string | null, mode: QueryStringMode}, key: string) => {
            if (mode === QueryStringMode.OVERWRITE) {
                if (_.isNil(val)) {
                    delete newQueryObject[key];
                } else {
                    newQueryObject[key] = val;
                }
                return;
            }

            if (_.isNil(val)) {
                logger.error('Cannot add a nil value to the querystring array! If you intended to remove the array entirely, use the OVERWRITE mode.', tabs, currentQuerystrings);
                return;
            }

            // Implicitly QueryStringMode.APPEND_OR_REMOVE
            const currentValue = currentQuerystrings[key];
            const currentArray = _.isArray(currentValue) ? currentValue : (
                _.isNil(currentValue) ? [] : [currentValue]
            );

            if (_.includes(currentArray, val)) {
                const filteredVal = _.without(currentArray, val);

                if (!_.isEmpty(filteredVal)) {
                    newQueryObject[key] = filteredVal;
                } else {
                    delete newQueryObject[key];
                }
            } else {
                newQueryObject[key] = [...currentArray, val];
            }
        });

        const queryString = qs.stringify(_(
            newQueryObject
        ).omitBy(_.isNil).omitBy(_.isEmpty).value() as any).toString();

        // Updating the state on the page should be a replace. It prevents us
        // from having to hit the back button multiple times.
        window.history.replaceState(null, 'React', `${url}?${queryString}`);

        // TODO: Conditionally allow re-rendering using the following alternative to replaceState.
        // history.replace(`${url}?${queryString}`);
    };

    // qs doesn't like the ? in the beginning of the search string.
    const getCurrentQueryStrings = () => qs.parse(window.location.search.substring(1));

    return {getCurrentQueryStrings, updateRoute};
};

export default useQuerystringHelper;
