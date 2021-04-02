import { RederlyAxiosWrapper } from '@rederly/rederly-backend-sdk';

export const rederlyBackendSDK = new RederlyAxiosWrapper({
    axiosConfig: {
        baseURL: '/backend-api',
        responseType: 'json',
        timeout: 180000, // 180 seconds
        headers: {
            /**
             * Forms send this field in the origin header, however that wasn't coming across with the axios request
             * Adding `origin` myself was getting stripped
             * Could not find solution online so used a custom header
             * Other headers don't work because they get modified by aws (between cloudfront and the load balancers)
             */
            'rederly-origin': window.location.origin,
        },
        // don't fail on any status code
        validateStatus: () => true
    }
});

export default rederlyBackendSDK;
(window as any).rederlyBackendSDK = rederlyBackendSDK;
