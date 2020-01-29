import { ConsoleMessage, Browser, LaunchOptions, Page } from "puppeteer"; //typescript
//import {Test} from "tape";  //typescript
const handler = require("serve-handler");
const http = require("http");
const net = require("net");

function getAvailablePort(startingAt) {
  function getNextAvailablePort(currentPort, cb) {
    const server = net.createServer();
    server.listen(currentPort, _ => {
      server.once("close", _ => {
        cb(currentPort);
      });
      server.close();
    });
    server.on("error", _ => {
      getNextAvailablePort(++currentPort, cb);
    });
  }

  return new Promise(resolve => {
    getNextAvailablePort(startingAt, resolve);
  });
}

const playwright = require("playwright");

export interface IXtalTestRunnerOptions {
  path: string;
  takeSnapshot?: boolean;
  launchOptions?: LaunchOptions;
  expectedNoOfSuccessMarkers?: number;
  customTest?: (page: Page, options: IXtalTestRunnerOptions) => void;
  wait?: number | undefined;
}

async function standardTest(page: Page, options: IXtalTestRunnerOptions) {
  const wait = options.wait !== undefined ? options.wait : 5000;
  await page.waitFor(wait);
  const errorTags = await page.$$("[err=true]");
  if (errorTags.length > 0) throw "Found tag with attribute err=true";
  const markings = await page.$$("[mark]");
  const noOfExpectedMarkings =
    options.expectedNoOfSuccessMarkers === undefined
      ? 0
      : options.expectedNoOfSuccessMarkers;
  if (markings.length !== noOfExpectedMarkings) {
    throw "Found " +
      markings.length +
      " tags with attribute mark.  Expecting " +
      noOfExpectedMarkings;
  }
}
export interface IXtalTestRunner {
  runTests(options: IXtalTestRunnerOptions[]);
  launchWebServer(defaultPort?: number);
}

async function launchWebServer(defaultPort: number = 3030) {
  let server = http.createServer((request, response) => {
    // You pass two more arguments for config and middleware
    // More details here: https://github.com/zeit/serve-handler#options
    return handler(request, response);
  });
  const port = await getAvailablePort(defaultPort);
  server = require("http-shutdown")(server);
  server.listen(port, () => {
    console.log("Running at http://localhost:" + port);
  });
}

async function runTests(tests: IXtalTestRunnerOptions[]) {
  console.log("running tests");
  let server = http.createServer((request, response) => {
    // You pass two more arguments for config and middleware
    // More details here: https://github.com/zeit/serve-handler#options
    return handler(request, response);
  });
  const port = await getAvailablePort(3000);
  server = require("http-shutdown")(server);
  server.listen(port, () => {
    console.log("Running at http://localhost:" + port);
  });

  const launchOptions = {
    headless: true,
    args: ["--enable-built-in-module-all"]
  } as LaunchOptions;
  let passed = true;
  for (const browserType of ['chromium', 'firefox', 'webkit']) {
    const browser = (await playwright[browserType].launch(launchOptions)) as any;

    try {
      for (const options of tests) {
        if (options.launchOptions)
          Object.assign(launchOptions, options.launchOptions);
        const context = await browser.newContext();
        const page = await context.newPage();
        page.on("console", (msg: ConsoleMessage) =>
          console.log("PAGE LOG:", msg.text())
        );
        //const devFile = path.resolve(__dirname, 'localhost:3000');

        const url = "http://localhost:" + port + "/" + options.path;
        console.log("going to " + url);
        await page.goto(url);
        if (options.takeSnapshot) {
          await page.screenshot({ path: "example.png" });
        }
        if (options.customTest) {
          await options.customTest(page, options);
        } else {
          await standardTest(page, options);
        }
      }
    } catch (e) {
      console.log(e);
      passed = false;
    }

    await shutDown(browser, server);
    if (!passed) {
      process.exit(1);
    }
  }
  return passed;
}

async function shutDown(browser: Browser, server: any) {
  await browser.close();
  server.shutdown(function() {
    console.log("Everything is cleanly shutdown.");
    process.exit();
  });
}

module.exports = { runTests: runTests, launchWebServer: launchWebServer };
