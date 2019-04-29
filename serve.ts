import { IXtalTestRunner, IXtalTestRunnerOptions } from './index.js';
const xt = require('./index') as IXtalTestRunner;
(async () => {
    await xt.launchWebServer();
})();