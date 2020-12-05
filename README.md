# Rederly Frontend

![Version](https://img.shields.io/github/v/release/rederly/frontend?style=plastic)
![Commit Activity](https://img.shields.io/github/commit-activity/m/rederly/frontend?style=plastic)
![License](https://img.shields.io/github/license/rederly/frontend?style=plastic)
![Build Status](https://img.shields.io/github/workflow/status/rederly/frontend/Node.js%20CI?style=plastic)

The website component of the Rederly application is written in React and Typescript.

Currently, the `PORT` to use is set inline in the `package.json` scripts.

To run a development server, use `npm start`.
To generate an optimized bundle for production usage, use `npm run build`.

## Proxying

The frontend requires the [Rederly Backend](https://github.com/rederly/backend) to run. To specify the ports to connect to, modify the values in `src/setupProxy.js` to match the location of your server.

