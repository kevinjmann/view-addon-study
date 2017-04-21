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
          "../viewWE/content_scripts/js/view.js",
          "../viewWE/content_scripts/js/lib.js",
          "../viewWE/content_scripts/js/selector.js",
          "../viewWE/content_scripts/js/toolbar-iframe.js",
          "../viewWE/content_scripts/js/container.js",
          "../viewWE/content_scripts/js/enhancer.js",
          "../viewWE/content_scripts/js/view-menu.js",
          "../viewWE/content_scripts/js/statistics-menu.js",
          "../viewWE/content_scripts/js/about.js",
          "../viewWE/content_scripts/js/blur.js",
          "../viewWE/content_scripts/js/notification.js",
          "../viewWE/content_scripts/js/sidebar.js",
          "../viewWE/content_scripts/js/feedbacker.js",
          "../viewWE/content_scripts/js/activities/tracker.js",
          "../viewWE/content_scripts/js/activities/activityHelper.js",
          "../viewWE/content_scripts/js/activities/color.js",
          "../viewWE/content_scripts/js/activities/click.js",
          "../viewWE/content_scripts/js/activities/mc.js",
          "../viewWE/content_scripts/js/activities/cloze.js",
          {pattern: "fixtures/**/*"}
        ],
        preprocessors: {
          "**/articles.json": ["json_fixtures"],
          "**/nouns.json": ["json_fixtures"],
          "**/en-det-mc-and-cloze.html": ["html2js"],
          "**/ru-no-markup.html": ["html2js"],
          "**/ru-nouns-click.html": ["html2js"],
          "**/ru-nouns-color.html": ["html2js"],
          "**/ru-nouns-mc-and-cloze.html": ["html2js"]
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
            "test/unit/content_scripts/view.test.js"
          ]
        },
        preprocessors: {"../viewWE/content_scripts/js/view.js": ["coverage"]}
      },
      viewMenu: {
        files: {
          src: [
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
            "test/unit/content_scripts/activities/color.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/color.js": ["coverage"]
        }
      },
      activityClick: {
        files: {
          src: [
            "test/unit/content_scripts/activities/click.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/click.js": ["coverage"]
        }
      },
      activityMc: {
        files: {
          src: [
            "test/unit/content_scripts/activities/mc.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/mc.js": ["coverage"]
        }
      },
      activityCloze: {
        files: {
          src: [
            "test/unit/content_scripts/activities/cloze.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/cloze.js": ["coverage"]
        }
      },
      activityHelper: {
        files: {
          src: [
            "test/unit/content_scripts/activities/activityHelper.test.js",
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/activityHelper.js": ["coverage"]
        }
      },
      tracker: {
        files: {
          src: [
            "test/unit/content_scripts/activities/tracker.test.js",
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/activities/tracker.js": ["coverage"]
        }
      },
      selector: {
        files: {
          src: [
            "test/unit/content_scripts/selector.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/selector.js": ["coverage"]
        }
      },
      toolbarIframe: {
        files: {
          src: [
            "test/unit/content_scripts/toolbar-iframe.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/toolbar-iframe.js": ["coverage"]
        }
      },
      container: {
        files: {
          src: [
            "test/unit/content_scripts/container.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/container.js": ["coverage"]
        }
      },
      enhancer: {
        files: {
          src: [
            "test/unit/content_scripts/enhancer.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/enhancer.js": ["coverage"]
        }
      },
      statisticsMenu: {
        files: {
          src: [
            "test/unit/content_scripts/statistics-menu.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/statistics-menu.js": ["coverage"],
          "**/statistics-menu.html": ["html2js"]
        }
      },
      feedbacker: {
        files: {
          src: [
            "test/unit/content_scripts/feedbacker.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/feedbacker.js": ["coverage"]
        }
      },
      lib: {
        files: {
          src: [
            "test/unit/content_scripts/lib.test.js"
          ]
        },
        preprocessors: {
          "../viewWE/content_scripts/js/lib.js": ["coverage"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-karma");
};
