import AxiosRequest from "../../../Hooks/AxiosRequest";
import { PutUploadWork } from "../RequestTypes/StudentUploadRequests";

/*
const res = await AxiosRequest.put(pre_sign_url.data.data.data.uploadURL, data, {
                headers: {
                    'Content-Type': 'application/pdf'
                }
            });
*/
export const putUploadWork = async ({
    presignedUrl,
    data,
}: PutUploadWork) => {
    const promArr = [];
    for (let file of data) {
        const prom = AxiosRequest.put(presignedUrl.toString(), file, {
            headers: {
                'Content-Type': file.type
            }
        });
        promArr.push(prom);
    }
    return Promise.all(promArr);
};