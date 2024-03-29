const handler = require('serve-handler');
const http = require('http');
const net = require('net');
const puppeteer = require('puppeteer');
function getAvailablePort(startingAt) {
    function getNextAvailablePort(currentPort, cb) {
        const server = net.createServer();
        server.listen(currentPort, _ => {
            server.once('close', _ => {
                cb(currentPort);
            });
            server.close();
        });
        server.on('error', _ => {
            getNextAvailablePort(++currentPort, cb);
        });
    }
    return new Promise(resolve => {
        getNextAvailablePort(startingAt, resolve);
    });
}
async function standardTest(page, options) {
    const wait = options.wait !== undefined ? options.wait : 5000;
    await page.waitFor(wait);
    const errorTags = await page.$$('[err=true]');
    if (errorTags.length > 0)
        throw 'Found tag with attribute err=true';
    const markings = await page.$$('[mark]');
    const noOfExpectedMarkings = options.expectedNoOfSuccessMarkers === undefined ? 0 : options.expectedNoOfSuccessMarkers;
    if (markings.length !== noOfExpectedMarkings) {
        throw "Found " + markings.length + " tags with attribute mark.  Expecting " + noOfExpectedMarkings;
    }
}
async function launchWebServer(defaultPort = 3030) {
    let server = http.createServer((request, response) => {
        // You pass two more arguments for config and middleware
        // More details here: https://github.com/zeit/serve-handler#options
        return handler(request, response, {
            cleanUrls: true,
            headers: [
                {
                    "source": "**/*",
                    "headers": [{
                        "key": "Access-Control-Allow-Origin",
                        "value": "*",
                    }]
                }
            ]
        });
    });
    const port = await getAvailablePort(defaultPort);
    server = require('http-shutdown')(server);
    server.listen(port, () => {
        console.log('Running at http://localhost:' + port);
    });
}
async function runTests(tests) {
    console.log('running tests');
    let server = http.createServer((request, response) => {
        // You pass two more arguments for config and middleware
        // More details here: https://github.com/zeit/serve-handler#options
        return handler(request, response);
    });
    const port = await getAvailablePort(3000);
    server = require('http-shutdown')(server);
    server.listen(port, () => {
        console.log('Running at http://localhost:' + port);
    });
    const launchOptions = {
        headless: true
    };
    const browser = await puppeteer.launch(launchOptions);
    let passed = true;
    try {
        for (const options of tests) {
            if (options.launchOptions)
                Object.assign(launchOptions, options.launchOptions);
            const page = await browser.newPage();
            page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
            //const devFile = path.resolve(__dirname, 'localhost:3000');
            const url = 'http://localhost:' + port + '/' + options.path;
            console.log('going to ' + url);
            await page.goto(url);
            if (options.takeSnapshot) {
                await page.screenshot({ path: 'example.png' });
            }
            if (options.customTest) {
                await options.customTest(page, options);
            }
            else {
                await standardTest(page, options);
            }
        }
    }
    catch (e) {
        console.log(e);
        passed = false;
    }
    await shutDown(browser, server);
    if (!passed) {
        process.exit(1);
    }
    return passed;
}
async function shutDown(browser, server) {
    await browser.close();
    server.shutdown(function () {
        console.log('Everything is cleanly shutdown.');
        process.exit();
    });
}
module.exports = { runTests: runTests, launchWebServer: launchWebServer };
