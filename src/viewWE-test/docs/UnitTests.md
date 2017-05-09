# Unit Tests

The unit tests are based on [Mocha](http://mochajs.org/),
[Sinon](http://sinonjs.org/) and [Chai](http://chaijs.com/). 
This gives a very simple mocking and test interface.

They are run using [Karma](https://karma-runner.github.io), which also provides
for code coverage. 
We use [grunt-karma](https://github.com/karma-runner/grunt-karma) to separate
background script from other scripts, such as the toolbar script or other content
scripts.

# WebExtension Stubbing

WebExtensions are automatically stubbed by the
[sinon-chrome](https://github.com/acvetkov/sinon-chrome) package.

# Test Files

The test files live in the `test/unit` directory. `Gruntfile.js`
controls the loading and running of tests.

# Running the Tests

Before you start, make sure that you can run grunt globally in a shell by
installing the [CLI](http://gruntjs.com/getting-started):

```shell
$ npm install -g grunt-cli
```

Run tests on all modules:

```shell
$ grunt karma
```

Run tests on a specific module:

```shell
$ grunt karma:module
```

Currently we have the modules:<br>
- background
- toolbar
- viewOptions
- view
- viewMenu
- activityColor
- activityClick
- activityMc
- activityCloze
- activityHelper
- tracker
- selector
- toolbarIframe
- container
- enhancer
- statisticsMenu
- feedbacker
- lib

# Viewing coverage output

You can view the code output in the `coverage/` directory, this is in html
format, so you can load it in the browser.

# Html and Json fixtures

If you need the help of html or/and json fixtures, it is possible to use them.
We make use of the library [karma-fixture](https://github.com/billtrik/karma-fixture)
together with [karma-html2js-preprocessor](https://github.com/karma-runner/karma-html2js-preprocessor)
for html files and [karma-json-fixtures-preprocessor](https://github.com/dmitriiabramov/karma-json-fixtures-preprocessor)
for json files.

You can access json fixtures in your tests in two ways:<br>
1) You set the base beforehand, to load the fixtures relative to the base:
```javascript
before(function(){
  fixture.setBase("fixtures");
});
```
Lets assume the json data is located in `fixtures/json/test.json`<br>
Load the json data via:
```javascript
it("plays with the json fixture", function(){
  const jsonData = fixture.load("json/test.json");
});
```

2) Or load the fixtures directly:
```javascript
it("plays with the json fixture", function(){
  const jsonData = fixture.load("fixtures/json/test.json");
});
```

When you want to use html fixtures, you need to have the line:<br>
 `"**/test.html": ["html2js"]`  <br>
 as one of your preprocessors for your configuration. Now you can 
 load the html fixtures similarly to before. Lets assume the html 
 file is in `fixtures/test.html`.
1) Set the base the same way as above and then:
```javascript
it("plays with the json fixture", function(){
  const htmlData = fixture.load("test.html")
});
```
2) Or load them directly:
```javascript
it("plays with the json fixture", function(){
  const htmlData = fixture.load("/fixtures/test.html")
});
```
The usefulness of html fixtures can be observed in `test/unit/toolbar.test.js`.<br>
There we use html fixtures to get access to the html content for the toolbar and
the jquery functions return meaningful results. We can also trigger e.g.
click events manually to test handlers.

Please read the official documentation of [karma-fixture](https://github.com/billtrik/karma-fixture)
if you run into troubles and to see how to use the fixtures in your test-code.