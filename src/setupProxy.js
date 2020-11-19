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

    app.use(createProxyMiddleware('/work', {
        target: 'http://localhost:3001'
    }));
};
