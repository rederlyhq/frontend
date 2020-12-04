import axios from 'axios';

export default axios.create({
    baseURL: '/backend-api',
    responseType: 'json',
    timeout: 180000 // 180 seconds
});