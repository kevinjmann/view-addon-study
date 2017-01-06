# Functional Tests

The functional tests in this repository are run via
[Selenium](http://www.seleniumhq.org/) and
[Geckodriver](https://github.com/mozilla/geckodriver).

Selenium is being driven via the node/javascript language, although python may
also work well (the
[Loop](https://github.com/mozilla/loop/blob/master/docs/Developing.md#functional-tests)
project used Python).

[Mocha](https://mochajs.org/) is used as the test framework.

# Name and version changes of the add-on

For the tests to run sucessfully keep the name and version of the add-on in check:

In ../package.json update:

XPI_NAME=dist/view-1.0.3063.zip

In ../test/functional/utils.js update:

By.id("view_mozilla_org-browser-action")

In this example the name is "view" and the version is "1.0.3063" which is in
synch with ../../viewWE/manifest.json

FYI:

"view_mozilla_org" refers to 

"applications": {
    "gecko": {
      "id": "view@mozilla.org"
    }
  }

in ../../viewWE/manifest.json

"browser-action" is the add-on button.

# Running the tests.

The functional tests can be run on their own by:

```
  $ npm run test:func
```

## Running against different browser versions.

TBD.

# Useful Documents

* [Javascript API for webdriver](https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/firefox/index.html)
