const path = require('path');
const webpackConfig = require('./webpack.config.js');
webpackConfig.devtool = 'inline-source-map';
webpackConfig.module.rules.unshift({
  enforce: 'post',
  test: /\.js$/,
  loader: 'istanbul-instrumenter-loader',
  exclude: /(node_modules|viewWE-test)/
});

module.exports = function(config) {
  config.set({
    files: [
      'viewWE-test/karma.entry.js',
      'viewWE-test/fixtures/*.html',
      'viewWE-test/fixtures/*.css',
      'viewWE-test/fixtures/json/*.json'
    ],

    preprocessors: {
      // test files
      'viewWE-test/karma.entry.js': ['webpack', 'sourcemap', 'coverage'],

      // fixtures
      'viewWE-test/fixtures/*.html': ['html2js'],
      'viewWE-test/fixtures/json/*.json': ['json_fixtures']
    },

    coverageIstanbulReporter: {
      reports: ['html', 'text-summary', 'lcov'],
      fixWebpackSourcePaths: true,
      dir: path.join(__dirname, 'viewWE-test/coverage')
    },

    reporters: ['progress', 'coverage-istanbul'],

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
