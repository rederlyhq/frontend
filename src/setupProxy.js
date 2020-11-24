// TODO we can use environment variables if need be
// eslint-disable-next-line no-undef
const { createProxyMiddleware } = require('http-proxy-middleware');
// eslint-disable-next-line no-undef
module.exports =  function(app) {
    app.use(createProxyMiddleware('/backend-api', {
        target: 'http://localhost:3001'
    }));

    app.use(createProxyMiddleware('/webwork2_files', {
        target: 'http://localhost:3000'
    }));

    /* If you're hosting attachments in an S3 bucket, point this proxy to that bucket.
       You may need to use `npm run start-https` and secure: true in the config
       object below if you get SSL errors. */
    // app.use(createProxyMiddleware('/work', {
    //     target: '',
    //     changeOrigin: true,
    //     secure: true,
    // }));
};
