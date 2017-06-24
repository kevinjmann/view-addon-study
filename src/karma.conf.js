const webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
  config.set({
    files: [
      'viewWE-test/**/*.test.js',
      'viewWE-test/fixtures/*.html',
      'viewWE-test/fixtures/json/*.json'
    ],

    preprocessors: {
      // test files
      'viewWE-test/**/*.test.js': ['webpack', 'sourcemap'],

      // fixtures
      'viewWE-test/fixtures/*.html': ['html2js'],
      'viewWE-test/fixtures/json/*.json': ['json_fixtures']
    },

    jsonFixturesPreprocessor: {
      variableName: '__json__'
    },

    webpack: webpackConfig,

    frameworks: ['chai', 'mocha', 'sinon', 'fixture', 'sinon-chrome'],

    browsers: ['Firefox', 'ChromiumHeadless'],

    webpackMiddleware: {
      stats: 'errors-only'
    }
  });
};
