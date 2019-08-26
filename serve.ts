import { IXtalTestRunner, IXtalTestRunnerOptions } from './index.js';
const xt = require('./index') as IXtalTestRunner;
const minimist = require('minimist');
const argv = require('minimist')(process.argv.slice(2));
(async () => {
    await xt.launchWebServer(argv.p ? parseInt(argv.p) : 3030);
})();