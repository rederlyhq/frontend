// Utility script doesn't have access to logger
/* eslint-disable no-console */
// Not typescript
/* eslint-disable @typescript-eslint/no-var-requires */

const fse = require('fs-extra');

const dirs = [
    'build',
    'package-outputs',
];

const promises = dirs.map(async (dir) => {
    const exists = await fse.pathExists(dir);
    if (exists) {
        await fse.remove(dir, {
            recursive: true
        });
    }
});

Promise.all(promises)
    .then(() => console.log('Success'))
    .catch(e => console.error('An error occurred', e));
