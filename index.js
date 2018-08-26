"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import {Test} from "tape";  //typescript
const handler = require('serve-handler');
const http = require('http');
let server = http.createServer((request, response) => {
    // You pass two more arguments for config and middleware
    // More details here: https://github.com/zeit/serve-handler#options
    return handler(request, response);
});
server = require('http-shutdown')(server);
server.listen(3000, () => {
    console.log('Running at http://localhost:3000');
});
const test = require('tape');
const puppeteer = require('puppeteer');
const path = require('path');
async function runTests(options, doCustomTests) {
    console.log('running tests');
    const launchOptions = {
        headless: true,
    };
    if (options.launchOptions)
        Object.assign(launchOptions, options.launchOptions);
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    //const devFile = path.resolve(__dirname, 'localhost:3000');
    const url = 'http://localhost:3000/' + options.path;
    console.log('going to ' + url);
    await page.goto('http://localhost:3000/' + path);
    await page.screenshot({ path: 'example.png' });
    await doCustomTests(page);
    await browser.close();
    server.shutdown(function () {
        console.log('Everything is cleanly shutdown.');
        process.exit();
    });
}
exports.runTests = runTests;
