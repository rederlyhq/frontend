import axios from 'axios';

const libraryBrowserAxios = axios.create({
    baseURL: '/library-browser',
    responseType: 'json',
    timeout: 180000 // 180 seconds
});

export default libraryBrowserAxios;
