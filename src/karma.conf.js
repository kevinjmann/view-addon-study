const webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
  config.set({
    files: [
      'viewWE-test/**/*.test.js',
      'spec/fixtures/**/*'
    ],

    preprocessors: {
      // test files
      'viewWE-test/**/*.test.js': ['webpack', 'sourcemap'],

      // fixtures
      '**/*.html'   : ['html2js'],
      '**/*.json'   : ['json_fixtures']
    },

    jsonFixturesPreprocessor: {
      variableName: '__json__'
    },

    webpack: webpackConfig,

    frameworks: ['chai', 'mocha', 'sinon', 'fixture'],

    browsers: ['Firefox', 'ChromiumHeadless'],

    webpackMiddleware: {
      stats: 'errors-only'
    }
  });
};
