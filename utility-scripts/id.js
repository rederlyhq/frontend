#!/usr/bin/env node

/**
 * This is used to preserver permissions to the person running the docker command
 */

const childProcess = require('child_process');
const { spawn } = childProcess;

const runId = (flag) => new Promise((resolve) => {
    try {
        const idProcess = spawn('id', [flag]);
        let stdout = '';
        let errout = '';
        idProcess.stdout.on('data', (data) => {
            stdout += data;
        });
        idProcess.stderr.on('data', (data) => {
            errout += data;
        });
        
        idProcess.on('error', function(err) {
            errout = err;
        });

        idProcess.on('close', (code) => {
            resolve({
                code: code,
                stdout: stdout,
                errout: errout,
            });
        });    
    } catch (e) {
        resolve({
            code: null,
            stdout: null,
            errout: e.message,
        });
    }
});


const getUserForDocker = async () => {
    const userIdResult = await runId('-u')
    let userId = parseInt(userIdResult.stdout, 10);
    userId = Number.isNaN(userId) ? 1000 : userId;

    const groupIdResult = await runId('-g')
    let groupId = parseInt(groupIdResult.stdout, 10);
    groupId = Number.isNaN(groupId) ? 1001 : groupId;
    return `${userId}:${groupId}`;
};

module.exports = {
    getUserForDocker: getUserForDocker
}

if (require.main === module) {
    // file was run directly
    (async () => {
        console.log(await getUserForDocker());
    })();
}
