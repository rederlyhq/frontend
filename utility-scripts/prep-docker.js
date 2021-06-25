#!/usr/bin/env node

/**
 * Make sure the mount point for the outputted docker files exists and is empty
 */
const OUTPUT_DIRECTORY='docker-output';
const fs = require('fs');

const prepDocker = async () => {
    if (fs.existsSync(OUTPUT_DIRECTORY)) {
        await fs.promises.rmdir(OUTPUT_DIRECTORY, {
            recursive: true
        });
    }
    await fs.promises.mkdir(OUTPUT_DIRECTORY);
};

module.exports = {
    prepDocker: prepDocker
};

if (require.main === module) {
    // file was run directly
    (async () => {
        await prepDocker();
    })();
}
