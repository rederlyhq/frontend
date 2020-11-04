#!/usr/bin/env node
/* eslint-disable no-undef */

const fs = require('fs');
const { version } = require('./package.json');

fs.writeFileSync('./build/version.txt', version);
