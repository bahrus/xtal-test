
import { ConsoleMessage, Browser, LaunchOptions, Page } from "puppeteer"; //typescript
//import {Test} from "tape";  //typescript
const handler = require('serve-handler');
const http = require('http');
const net = require('net');



function getAvailablePort(startingAt) {

    function getNextAvailablePort(currentPort, cb) {
        const server = net.createServer()
        server.listen(currentPort, _ => {
            server.once('close', _ => {
                cb(currentPort)
            })
            server.close()
        })
        server.on('error', _ => {
            getNextAvailablePort(++currentPort, cb)
        })
    }

    return new Promise(resolve => {
        getNextAvailablePort(startingAt, resolve)
    })
}





const puppeteer = require('puppeteer');

export interface IXtalTestRunnerOptions {
    path: string,
    takeSnapshot?: boolean,
    launchOptions?: LaunchOptions
}
export interface IXtalTestRunner {
    runTests(options: IXtalTestRunnerOptions, doCustomTests: (page: Page) => void);
}



async function runTests(options: IXtalTestRunnerOptions, doCustomTests: (page: Page) => void) {
    console.log('running tests');
    let server = http.createServer((request, response) => {
        // You pass two more arguments for config and middleware
        // More details here: https://github.com/zeit/serve-handler#options
        return handler(request, response);
    })
    const port = await getAvailablePort(3000);
    server = require('http-shutdown')(server);
    server.listen(port, () => {
        console.log('Running at http://localhost:' + port); 
    });
    
    const launchOptions = {
        headless: true,
        //args:['--allow-file-access-from-files']
    } as LaunchOptions;
    if (options.launchOptions) Object.assign(launchOptions, options.launchOptions);
    const browser = await puppeteer.launch(launchOptions) as Browser;
    const page = await browser.newPage();
    page.on('console', (msg: ConsoleMessage) => console.log('PAGE LOG:', msg.text()));
    //const devFile = path.resolve(__dirname, 'localhost:3000');

    const url = 'http://localhost:' + port + '/' + options.path;
    console.log('going to ' + url);
    await page.goto(url);
    if (options.takeSnapshot) {
        await page.screenshot({ path: 'example.png' });
    }

    await doCustomTests(page);
    await browser.close();
    server.shutdown(function () {
        console.log('Everything is cleanly shutdown.');
        process.exit();
    });
}

module.exports = {runTests: runTests};

