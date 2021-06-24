#!/usr/bin/env node

/**
 * Make sure the mount point for the outputted docker files exists and is empty
 */
const OUTPUT_DIRECTORY='docker-output';
const fs = require('fs');

(async () => {
    if (fs.existsSync(OUTPUT_DIRECTORY)) {
        await fs.promises.rmdir(OUTPUT_DIRECTORY, {
            recursive: true
        });
    }
    await fs.promises.mkdir(OUTPUT_DIRECTORY);
})();
