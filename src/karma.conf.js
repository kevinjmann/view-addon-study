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

    browsers: ['Firefox', 'ChromiumHeadless'],

    webpackMiddleware: {
      stats: 'errors-only'
    },

    plugins: [
      require('karma-webpack'),
      require('karma-firefox-launcher'),
      require('karma-chrome-launcher'),
      require('karma-sourcemap-loader')
    ]
  });
};
