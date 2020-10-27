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
    await AxiosRequest.put(presignedUrl.toString(), data, {
        headers: {
            // TODO: Detect?
            'Content-Type': 'image/*'
        }
    });
};