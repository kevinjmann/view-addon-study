module.exports = function(config) {
  config.set({
    files: [
      'viewWE-test/**/*.test.js'
    ],

    preprocessors: {
      'test/**/*.test.js': ['webpack', 'sourcemap']
    },

    webpack: {
      devtool: 'inline-source-map'
    },

    webpackMiddleware: {
      stats: 'errors-only'
    },

    plugins: [
      require('karma-webpack')
    ]
  });
};
