
import { ConsoleMessage, Browser, LaunchOptions, Page  } from "puppeteer"; //typescript
//import {Test} from "tape";  //typescript
const handler = require('serve-handler');
const http = require('http');

let server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/zeit/serve-handler#options
  return handler(request, response);
})
server = require('http-shutdown')(server);
server.listen(3000, () => {
  console.log('Running at http://localhost:3000');
});



const test = require('tape');
const puppeteer = require('puppeteer');
const path = require('path');
// const TapeTestRunner = {
//     test: test
// } as Test;

export async function runTests(path: string, doCustomTests: (page: Page) => void){
    console.log('running tests');
    const launchOptions = {
        headless: true,
        //args:['--allow-file-access-from-files']
    } as LaunchOptions;
    const browser = await puppeteer.launch(launchOptions) as Browser;
    const page = await browser.newPage();
    page.on('console', (msg: ConsoleMessage) => console.log('PAGE LOG:', msg.text()));
    //const devFile = path.resolve(__dirname, 'localhost:3000');
    const url = 'http://localhost:3000/' + path;
    console.log('going to ' + url);
    await page.goto('http://localhost:3000/' + path);
    await page.screenshot({path: 'example.png'});
    await doCustomTests ? doCustomTests(page) : null;
    await browser.close();
    server.shutdown(function() {
        console.log('Everything is cleanly shutdown.');
        process.exit();
      });
    //await delay(4000);
    //await page.waitFor(4000);
    // const textContent = await page.$eval('page-2c', (c: any) => c.shadowRoot.querySelector('page-3c'));
    // await page.screenshot({path: 'example.png'});
    // await browser.close();
    // TapeTestRunner.test('testing dev.html', t => {
    //     t.ok(textContent);
    //     t.end();
    // });
}

