#!/usr/bin/env node

/**
 * Cross platform pwd (currently used for docker volume of relative directory)
 */
const pwd = () => process.env.PWD;

module.exports = {
    pwd: pwd
}

if (require.main === module) {
    // file was run directly
    console.log(pwd());
}