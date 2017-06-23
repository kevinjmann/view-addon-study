const webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
  config.set({
    files: [
      'viewWE-test/**/*.test.js'
    ],

    preprocessors: {
      'viewWE-test/**/*.test.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    frameworks: ['chai', 'mocha', 'sinon'],

    browsers: ['Firefox', 'ChromiumHeadless'],

    webpackMiddleware: {
      stats: 'errors-only'
    }
  });
};
