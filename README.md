# xtal-test

This package is deprecated.  Use playwright instead.

xtal-test provides, for starters, a simple local web file server.  To use, 

1.  Add this to your package.json file:

```JSON
"scripts": {
    "serve": "node node_modules/xtal-test/serve.js"
}
```

2.  Run command "npm run serve"

xtal-test lacks support for Hot Module Replacement, so you will need to refresh your browser to see your changes.

But the reason this package is called xtal-test is because it provides an HTML-centric unit test (ish) approach, where the unit tests are based on testing a web component.  Perhaps the scope could be broader, but that is the driving reason for this package.

The tests rely on Puppeteer (and/or PlayWright[TODO]) as the host environment in which the tests run.  The thinking is that web components are generally fairly close to "the metal" as far as integrating with the browser.  Yes, they have JavaScript in them, typically, but web component logic usually doesn't make much sense outside a browser setting.

Rather than writing lots of code, the only code that needs to be written looks as follows:

```JavaScript
const xt = require('xtal-test/index');
(async () => {
    const passed = await xt.runTests([
        {
            path: 'test/fly-d.html',
            expectedNoOfSuccessMarkers: 4,
        },
        {
            path: 'test/fly-unt.html',
            expectedNoOfSuccessMarkers: 1
        },
        {
            path: 'test/fly-w.html',
            expectedNoOfSuccessMarkers: 1
        },
        {
            path: 'test/fly-u.html',
            expectedNoOfSuccessMarkers: 2
        }
    ]);
    if (passed) {
        console.log("Tests Passed.  Have a nice day.");
    }
})();
```

A success marker is a tag somewhere in the "page" with attribute "mark".

It's up to the designer of the test to figure out how to create an html document which will generate DOM/Custom Elements with the "mark" attribute.

Unlike the typical verbose unit testing script required with unit testing libraries, you won't get much useful information in the console as to *why* the tests failed, just the number of marks found, versus how many were expected.  However, I think there are a variety of ways it can be made quite clear by just opening the page directly in your browser, as to what failed.

These tests also provide a way to make the entire test fail:  

```html
<any-tag err=true></any-tag>
```

It's been proven that xtal-test is compatible with GitHub Actions.