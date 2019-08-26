"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xt = require('./index');
const minimist = require('minimist');
const argv = require('minimist')(process.argv.slice(2));
(async () => {
    await xt.launchWebServer(argv.p ? parseInt(argv.p) : 3030);
})();
