import { useRouteMatch } from 'react-router-dom';
import * as qs from 'querystring';
import _ from 'lodash';
import { useQuery } from './UseQuery';

type QuerystringObject = {[key: string]: {
    val: string,
    toggle?: Boolean,
}}

/**
 * This hook provides helpers to add querystrings to your URL.
 */
export const useQuerystringHelper = () => {
    const { url } = useRouteMatch();
    const queryParams = useQuery();

    const updateRoute = (tabs: QuerystringObject): void => {
        const currentQuerystrings = new URLSearchParams(window.location.search);

        const newQueryObject: {[x: string]: string[]} = {};
        _.forOwn(tabs, (val: {val: string, toggle?: Boolean}, key: string) => {
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
