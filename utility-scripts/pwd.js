#!/usr/bin/env node

/**
 * Cross platform pwd (currently used for docker volume of relative directory)
 * Technically if the node changes directories this is wrong (that's the difference between pwd and cwd, pwd is static from the beginning)
 * However since we don't do that just switching so that this works for pwershell since process.env.PWD is undefined on windows with powershell
 */
const pwd = () => process.cwd();

module.exports = {
    pwd: pwd
}

if (require.main === module) {
    // file was run directly
    console.log(pwd());
}