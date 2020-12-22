import { useRouteMatch, useHistory } from 'react-router-dom';
import * as qs from 'querystring';
import _ from 'lodash';
import { useQuery } from './UseQuery';

type QuerystringObject = {[key: string]: (string | Array<string>)}

/**
 * This hook provides helpers to add querystrings to your URL.
 */
export const useQuerystringHelper = () => {
    const { url } = useRouteMatch();
    const history = useHistory();
    const queryParams = useQuery();

    const updateRoute = (tabs: QuerystringObject): void => {
        const queryString = qs.stringify(_(
            tabs
        ).omitBy(_.isNil).value() as any).toString();

        history.push(`${url}?${queryString}`);
    };
    console.log(queryParams);
    const getQuerystring = queryParams;

    return {getQuerystring, updateRoute};
};

export default useQuerystringHelper;
