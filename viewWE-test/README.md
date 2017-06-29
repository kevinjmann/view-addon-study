[![Build Status](https://travis-ci.org/Standard8/example-webextension.svg?branch=master)](https://travis-ci.org/Standard8/example-webextension)
[![Coverage Status](https://coveralls.io/repos/github/Standard8/example-webextension/badge.svg?branch=master)](https://coveralls.io/github/Standard8/example-webextension?branch=master)

# What's here

This repository includes the VIEW add-on, and the
infrastructure to build and test it using Firefox.

It has test suites for [lint](https://en.wikipedia.org/wiki/Lint_(software)),
[unit](https://en.wikipedia.org/wiki/Unit_testing), and
[integration/](https://en.wikipedia.org/wiki/Integration_testing)
[functional](https://en.wikipedia.org/wiki/Functional_testing)
testing. There's also code coverage for the unit tests.

# Quick Start

* Copy the files from this repository into a new one you've created (don't forget
  the .* files, but not the .git folder!).
* Run `npm install`
* Run `npm test` to check that everything is OK.

# Source Tree Outline

* `docs/`
  * Useful documents!
* `test/`
  * Tests for the add-on including unit and functional tests.
* `.eslintrc.js`, `.eslintignore`
  * The configuration for [eslint](http://eslint.org/), used to
    [lint](https://en.wikipedia.org/wiki/Lint_(software)) the code.
* `Gruntfile.js`
  * The configuration for running the unit tests in `test/unit`.

# Documentation

* [Building, running code and tests](docs/Developing.md)
* Testing
  * [Linting](docs/Linting.md)
  * [Unit Tests](docs/UnitTests.md)
  * [Functional Tests](docs/Functional.md)