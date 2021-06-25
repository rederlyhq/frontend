# Rederly Frontend

![Version](https://img.shields.io/github/v/release/rederly/frontend?style=plastic)
![Commit Activity](https://img.shields.io/github/commit-activity/m/rederly/frontend?style=plastic)
![License](https://img.shields.io/github/license/rederly/frontend?style=plastic)
![Build Status](https://img.shields.io/github/workflow/status/rederly/frontend/Node.js%20CI?style=plastic)
![Lines of code](https://img.shields.io/tokei/lines/github/rederly/frontend?style=plastic)

The website component of the Rederly application is written in React and Typescript.

Currently, the `PORT` to use is set inline in the `package.json` scripts.

To run a development server, use `npm start`.
To generate an optimized bundle for production usage, use `npm run build`.

## Proxying

The frontend requires the [Rederly Backend](https://github.com/rederly/backend) to run. To specify the ports to connect to, modify the values in `src/setupProxy.js` to match the location of your server.

| Path | Description |
| --- | --- |
| backend-api | This is the path that's used to proxy requests to the backend via the AxiosRequest object. |
| webwork2_files | This is the path that's used to proxy requests to the Renderer, or a webserver serving your WeBWorK assets. |
| work | This is a path that's used to proxy requests to your S3 Bucket, or a server serving your attachments assets. |

## Environment Variables

The frontend uses environment variables to configure some runtime settings. Currently, these are limited to development debugging tools and cannot be enabled in production.

| Variable | Example Values | Description |
| --- | --- | --- |
| REACT_APP_ENABLE_WDYR | REACT_APP_ENABLE_WDYR=true | This enables [WhyDidYouRender](https://github.com/welldone-software/why-did-you-render) functionality. This is useful for optimization debugging, or finding problems caused by unnecessary rerenders. |
| REACT_APP_ENABLE_AXE | REACT_APP_ENABLE_AXE=true | This enables [React Axe](https://github.com/dequelabs/react-axe) functionality. This is useful for accessibility (a11y) auditing. |

# Building / Running
```bash
npm install

# Build react app
npm run build

# Build react app and compress to zip file and tarball - mainly for use within github actions
npm run build:package

# Build react app in a docker container and output the files to docker-output
npm run build:docker
```

## Windows docker disclaimer
### Git config
If running on windows line endings will ruin your day... I recommend:
```bash
git config --global core.autocrlf false
git config --global core.eol lf
```

### Convert existing line items
[dos2unix](https://www.npmjs.com/package/dos2unix) on npm is a great tool and you can use the below command in git bash to convert all existing files on windows (obviously beware that this will change the files on you, should not cause harm but could mess up your source)
```bash
find . -type f -exec npx dos2unix {} ';'
```
