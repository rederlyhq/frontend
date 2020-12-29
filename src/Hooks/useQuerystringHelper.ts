import { useRouteMatch } from 'react-router-dom';
import * as qs from 'querystring';
import _ from 'lodash';
import { useQuery } from './UseQuery';

type QuerystringObject = {[key: string]: {
    val: string | null,
    // Toggle based on the VALUE of the key passed in.
    // If false, just replace the key with this value.
    // Currently must be true if using arrays.
    toggle?: Boolean,
}}

/**
 * This hook provides helpers to add querystrings to your URL.
 */
export const useQuerystringHelper = () => {
    const { url } = useRouteMatch();
    const queryParams = useQuery();

    const updateRoute = (tabs: QuerystringObject, append: boolean = false): void => {
        const currentQuerystrings = new URLSearchParams(window.location.search);

        const newQueryObject: {[x: string]: string | string[]} = append ? qs.parse(currentQuerystrings.toString()) : {};

        _.forOwn(tabs, (val: {val: string | null, toggle?: Boolean}, key: string) => {
            // A nil value is omitted from the URL.
            if (_.isNil(val.val)) {
                newQueryObject[key] = [];
                return;
            }

            if (val.toggle !== true) {
                newQueryObject[key] = [val.val];
                return;
            }

            const currVal = currentQuerystrings.getAll(key);

            // If the val is already in the URL, remove it.
            if (_.includes(currVal, val.val)) {
                const filteredVal = _.without(currVal, val.val);

                if (!_.isEmpty(filteredVal)) {
                    newQueryObject[key] = filteredVal;
                } else {
                    delete newQueryObject[key];
                }
            } else {
                newQueryObject[key] = [...currVal, val.val];
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

    const getQuerystring = queryParams;

    return {getQuerystring, updateRoute};
};

export default useQuerystringHelper;
