module.exports = function(grunt) {
  grunt.initConfig({
    karma: {
      options: {
        singleRun: true,
        browsers: ["Firefox"],
        frameworks: ["mocha", "chai", "fixture"],
        reporters: ["mocha", "coverage"],
        coverageReporter: {
          dir: "coverage",
          reporters: [
            {
              type: "html",
              subdir(browser) {
                // normalization process to keep a consistent browser name
                // across different OS
                return browser.toLowerCase().split(/[ /-]/)[0];
              }
            }, {type: "text-summary"}
          ]
        },
        jsonFixturesPreprocessor: {variableName: "__json__"},
        files: [
          "../viewWE/lib/jquery-*.js",
          "node_modules/sinon/pkg/sinon.js",
          "node_modules/sinon-chrome/bundle/sinon-chrome.min.js",
          {pattern: "fixtures/**/*"}
        ],
        preprocessors: {
          "**/articles.json": ["json_fixtures"]
        },
        plugins: [
          "karma-coverage",
          "karma-firefox-launcher",
          "karma-mocha",
          "karma-mocha-reporter",
          "karma-chai",
          "karma-fixture",
          "karma-html2js-preprocessor",
          "karma-json-fixtures-preprocessor"
        ]
      },
      background: {
        files: {
          src: [
            "../viewWE/*.js",
            "test/unit/*.test.js"
          ]
        },
        preprocessors: {"../viewWE/*.js": ["coverage"]}
      },
      toolbar: {
        files: {
          src: [
            "../viewWE/toolbar/*.js",
            "test/unit/toolbar/*.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/toolbar/*.js": ["coverage"],
          "**/toolbar.html": ["html2js"]
        }
      },
      viewOptions: {
        files: {
          src: [
            "../viewWE/options/*.js",
            "test/unit/options/*.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/options/*.js": ["coverage"],
          "**/options.html": ["html2js"]
        }
      },
      view: {
        files: {
          src: [
            "../viewWE/content_scripts/js/selector-cache.js",
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/interaction.js",
            "test/unit/content_scripts/view.test.js"
          ]
        },
        preprocessors: {"../viewWE/content_scripts/js/view.js": ["coverage"]}
      },
      viewMenu: {
        files: {
          src: [
            "../viewWE/content_scripts/js/selector-cache.js",
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/about.js",
            "../viewWE/content_scripts/js/view-menu.js",
            "test/unit/content_scripts/view-menu.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/view-menu.js": ["coverage"],
          "**/view-menu.html": ["html2js"]
        }
      },
      activityColor: {
        files: {
          src: [
            "../viewWE/content_scripts/js/selector-cache.js",
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/activities/color.js",
            "test/unit/content_scripts/activities/color.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/color.js": ["coverage"],
          "**/ru-nouns-color.html": ["html2js"]
        }
      },
      activityClick: {
        files: {
          src: [
            "../viewWE/content_scripts/js/selector-cache.js",
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/collector.js",
            "../viewWE/content_scripts/js/activities/activityHelper.js",
            "../viewWE/content_scripts/js/activities/click.js",
            "test/unit/content_scripts/activities/click.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/click.js": ["coverage"],
          "**/ru-nouns-click.html": ["html2js"]
        }
      },
      activityMc: {
        files: {
          src: [
            "../viewWE/content_scripts/js/selector-cache.js",
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/collector.js",
            "../viewWE/content_scripts/js/activities/activityHelper.js",
            "../viewWE/content_scripts/js/activities/mc.js",
            "test/unit/content_scripts/activities/mc.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/mc.js": ["coverage"],
          "**/ru-nouns-mc-and-cloze.html": ["html2js"]
        }
      },
      activityCloze: {
        files: {
          src: [
            "../viewWE/content_scripts/js/selector-cache.js",
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/collector.js",
            "../viewWE/content_scripts/js/activities/activityHelper.js",
            "../viewWE/content_scripts/js/activities/cloze.js",
            "test/unit/content_scripts/activities/cloze.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/cloze.js": ["coverage"],
          "**/ru-nouns-mc-and-cloze.html": ["html2js"]
        }
      },
      activityHelper: {
        files: {
          src: [
            "../viewWE/content_scripts/js/selector-cache.js",
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/collector.js",
            "../viewWE/content_scripts/js/activities/activityHelper.js",
            "../viewWE/content_scripts/js/activities/mc.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/activityHelper.test.js": ["coverage"],
          "**/ru-nouns-mc-and-cloze.html": ["html2js"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-karma");
};
