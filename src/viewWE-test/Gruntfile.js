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
          "**/articles.json": ["json_fixtures"],
          "**/nouns.json": ["json_fixtures"]
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
            "../viewWE/background.js",
            "test/unit/background.test.js"
          ]
        },
        preprocessors: {"../viewWE/background.js": ["coverage"]}
      },
      toolbar: {
        files: {
          src: [
            "../viewWE/toolbar/toolbar.js",
            "test/unit/toolbar/toolbar.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/toolbar/toolbar.js": ["coverage"],
          "**/toolbar.html": ["html2js"]
        }
      },
      viewOptions: {
        files: {
          src: [
            "../viewWE/options/options.js",
            "test/unit/options/options.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/options/options.js": ["coverage"],
          "**/options.html": ["html2js"]
        }
      },
      view: {
        files: {
          src: [
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/enhancer.js",
            "test/unit/content_scripts/view.test.js"
          ]
        },
        preprocessors: {"../viewWE/content_scripts/js/view.js": ["coverage"]}
      },
      viewMenu: {
        files: {
          src: [
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
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/selector.js",
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
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/selector.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/tracker.js",
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
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/selector.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/tracker.js",
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
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/selector.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/tracker.js",
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
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/selector.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/tracker.js",
            "../viewWE/content_scripts/js/activities/activityHelper.js",
            "test/unit/content_scripts/activities/activityHelper.test.js",
            "../viewWE/content_scripts/js/activities/click.js",
            "../viewWE/content_scripts/js/activities/mc.js",
            "../viewWE/content_scripts/js/activities/cloze.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/activityHelper.js": ["coverage"],
          "**/ru-nouns-mc-and-cloze.html": ["html2js"]
        }
      },
      tracker: {
        files: {
          src: [
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/tracker.js",
            "test/unit/content_scripts/activities/tracker.test.js",
            "../viewWE/content_scripts/js/activities/activityHelper.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/tracker.js": ["coverage"],
          "**/ru-nouns-mc-and-cloze.html": ["html2js"]
        }
      },
      selector: {
        files: {
          src: [
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/selector.js",
            "test/unit/content_scripts/selector.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/selector.js": ["coverage"],
          "**/ru-nouns-mc-and-cloze.html": ["html2js"]
        }
      },
      toolbarIframe: {
        files: {
          src: [
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/toolbar-iframe.js",
            "../viewWE/content_scripts/js/container.js",
            "../viewWE/content_scripts/js/view-menu.js",
            "../viewWE/content_scripts/js/about.js",
            "test/unit/content_scripts/toolbar-iframe.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/toolbar-iframe.js": ["coverage"],
          "**/ru-no-markup.html": ["html2js"]
        }
      },
      container: {
        files: {
          src: [
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/toolbar-iframe.js",
            "../viewWE/content_scripts/js/container.js",
            "../viewWE/content_scripts/js/view-menu.js",
            "../viewWE/content_scripts/js/about.js",
            "test/unit/content_scripts/container.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/container.js": ["coverage"],
          "**/ru-no-markup.html": ["html2js"]
        }
      },
      enhancer: {
        files: {
          src: [
            "../viewWE/content_scripts/js/view.js",
            "../viewWE/content_scripts/js/selector.js",
            "../viewWE/content_scripts/js/enhancer.js",
            "../viewWE/content_scripts/js/view-menu.js",
            "../viewWE/content_scripts/js/about.js",
            "../viewWE/content_scripts/js/blur.js",
            "../viewWE/content_scripts/js/notification.js",
            "../viewWE/content_scripts/js/lib.js",
            "../viewWE/content_scripts/js/activities/activityHelper.js",
            "../viewWE/content_scripts/js/activities/color.js",
            "../viewWE/content_scripts/js/activities/click.js",
            "../viewWE/content_scripts/js/activities/mc.js",
            "../viewWE/content_scripts/js/activities/cloze.js",
            "test/unit/content_scripts/enhancer.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/enhancer.js": ["coverage"],
          "**/ru-no-markup.html": ["html2js"],
          "**/ru-nouns-mc-and-cloze.html": ["html2js"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-karma");
};
