import _ from 'lodash';

export const formDataToObject = (formData: FormData) => {
    const object:any = {};
    // downstream iterator error
    // @ts-ignore
    for(const pair of formData.entries()) {
        if (_.isUndefined(object[pair[0]])) {
            object[pair[0]] = pair[1];
        } else {
            if(!_.isArray(object[pair[0]])) {
                object[pair[0]] = [object[pair[0]]];
            }
            object[pair[0]].push(pair[1]);
        }
    }
    return object;
};
