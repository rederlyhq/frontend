#!/usr/bin/env node
// standalone script
/* eslint-disable no-console */
// Not typescript
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs-extra');
const archiver = require('archiver');

const buildDir = 'build';

const {
    REDERLY_PACKAGER_ARCHIVE_ZIP = null,
    REDERLY_PACKAGER_ARCHIVE_TAR = null,
    REDERLY_PACKAGER_DEST_FILE = null
} = process.env;

console.log(`Env: ${JSON.stringify({
    REDERLY_PACKAGER_ARCHIVE_ZIP,
    REDERLY_PACKAGER_ARCHIVE_TAR,
    REDERLY_PACKAGER_DEST_FILE
}, null, 2)}`);
const destFile = process.argv[2] || REDERLY_PACKAGER_DEST_FILE || 'dist';

console.log(`Starting to package project into ${destFile}`);

/**
 * Initially wasn't going to do async
 * however removeDirSync seems to be working async
 * also it is faster to copy everything at once
 */
(async () => {
    const distDirectory = 'package-outputs';
    if (await fs.pathExists(distDirectory)) {
        await fs.remove(distDirectory, {
            recursive: true
        });
    }
    await fs.mkdir(distDirectory);

    const createArchive = (format, options, outputFile, inputDirectory) => new Promise((resolve, reject) => {
        console.log(`Packing into ${outputFile}`);
        const archive = archiver(format, options);
        let errored = false;
        archive.on('error', err => {
            errored = true;
            reject(err);
        });

        archive.on('close', () => {
            if (errored) {
                console.error(`Archive ${inputDirectory} ==> ${outputFile} already errored and now it is closing, ignoring`);
            } else {
                console.log(`Archive ${inputDirectory} ==> ${outputFile} complete`);
                resolve(archive.pointer());
            }
        });

        const outputStream = fs.createWriteStream(outputFile);
        archive.pipe(outputStream);
        archive.directory(inputDirectory, inputDirectory);
        archive.finalize();
    });

    const archivePromises = [];
    if (REDERLY_PACKAGER_ARCHIVE_TAR !== 'false') {
        const tarPromise = createArchive('tar', {
            gzip: true
        }, `${distDirectory}/${destFile}.tgz`, buildDir);
        archivePromises.push(tarPromise);    
    } else {
        console.log('REDERLY_PACKAGER_ARCHIVE_TAR is set to false, skipping tar');
    }

    if (REDERLY_PACKAGER_ARCHIVE_ZIP !== 'false') {
        const zipPromise = createArchive('zip', null, `${distDirectory}/${destFile}.zip`, buildDir);
        archivePromises.push(zipPromise);    
    } else {
        console.log('REDERLY_PACKAGER_ARCHIVE_ZIP is set to false, skipping zip');
    }

    await Promise.all(archivePromises);
    console.log('Packaging complete');
})();
