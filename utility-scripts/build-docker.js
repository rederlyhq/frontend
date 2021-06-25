#!/usr/bin/env node

/**
 * Initially had this command in package.json however this did not work on windows for a bunch of reasons
 * "build:docker": "node ./utility-scripts/prep-docker.js && docker run --user \"$(node ./utility-scripts/id.js)\" -v $(node ./utility-scripts/pwd.js)/docker-output:/docker-output --rm -it $(docker build -q -f ./build.Dockerfile .) ./utility-scripts/post-docker.sh",
 * 
 * Running the commands seperately worked but I want this to be extremely automated, and hopefully to work within a docker compose
 * Reasons:
 * 1. Issues with git bash terminal ("the input device is not a TTY" winpty)
 * 2. Depending on quotes I would get different errors like something about docker reference
 * 
 * Breakdown:
 * node ./utility-scripts/prep-docker.js // Clean the docker output directory and make sure it exists
 * node ./utility-scripts/id.js // Cross platform gets id, defaults to 1000:1001 if id command does not exist or does not give a number
 */
const childProcess = require('child_process');
const { prepDocker } = require('./prep-docker');
const { pwd } = require('./pwd');
const { getUserForDocker } = require('./id');

// const getBuildDockerCommand = async () => {
//     const currentDirectory = await pwd();
//     const user = await getUserForDocker();
//     return `docker run --user "${user}" -v ${currentDirectory}/docker-output:/docker-output --rm -it $(docker build -q -f ./build.Dockerfile .) ./utility-scripts/post-docker.sh`;
// };

const DOCKER_BUILD_COMMAND = 'docker build -q -f ./build.Dockerfile .';

const getDockerRunCommand = async (containerId) => {
    const currentDirectory = await pwd();
    const user = await getUserForDocker();
    return `docker run --user "${user}" -v "${currentDirectory}/docker-output:/docker-output" --rm "${containerId.trim()}" ./utility-scripts/post-docker.sh`;
};

const runCommand = (command) => new Promise((resolve, reject) => {
    const process = childProcess.exec(command);
    const result = {
        code: null,
        stdout: '',
        stderr: '',
    }
    console.log(`${process.pid}: Starting ${command}`);
    process.stdout.on('data', (data) => {
        console.log(`${process.pid}: stdout: ${data}`);
        result.stdout += data;
    });
    process.stderr.on('data', (data) => {
        console.log(`${process.pid}: stderr: ${data}`);
        result.stderr += data;
    });
    
    process.on('error', function(err) {
        reject(result);
    });

    process.on('close', (code) => {
        console.log(`${process.pid}: close: ${code}`);
        code === 0 ? resolve(result) : reject(result);
    });
});

const runBuildDocker = async () => {
    await prepDocker();
    const { stdout: containerId } = await runCommand(DOCKER_BUILD_COMMAND);
    const dockerRunCommand = await getDockerRunCommand(containerId);
    await runCommand(dockerRunCommand);
};


if (require.main === module) {
    // file was run directly
    (async () => {
        await runBuildDocker();
    })();
}
