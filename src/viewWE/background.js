const theServerURL = "https://view.aleks.bg";
/** @namespace */

const $ = require('jquery');

const background = {
  currentTabId: -1,
  clickCounter: 0,
  topics: {},
  /**
   * Set all default values to storage.
   * This is only toggleed once after the add-on was installed.
   */
  setDefaults: function() {
    chrome.storage.local.set({
      // General options
      serverURL: theServerURL,
      servletURL: theServerURL + "/view",
      serverTaskURL: theServerURL + "/act/task",
      serverTrackingURL: theServerURL + "/act/tracking",
      authenticator: theServerURL + "/authenticator.html",
      ajaxTimeout: 60000,
      topics: {},
      userEmail: "",
      userid: "",

      // task data
      user: "",
      token: "",
      taskId: "",
      timestamp: "",
      numberOfExercises: 0,

      // user options
      fixedOrPercentage: 0,
      fixedNumberOfExercises: 25,
      percentageOfExercises: 100,
      choiceMode: 0,
      firstOffset: 0,
      intervalSize: 1,
      showInst: false,
      debugSentenceMarkup: false,

      // enabled, language, topic and activity selections
      enabled: false, // should the page be enhanced right away?
      language: "unselected",
      topic: "unselected",
      filter: "no-filter",
      activity: "unselected"
    });
  },

  /**
   * A function that is supposed to be a placeholder for a response callback.
   */
  noResponse: function() {
    // this is intentional
  },

  /**
   * The topics are being loaded and set for the first time.
   * When they are set, proceed to toggle the toolbar.
   * Create notification otherwise.
   */
  setTopics: function() {

    background.initTopics();

    background.getAndSetTopicURLs();

    $.when(
      $.getJSON(background.topics.articles.url, function(data) {
        background.topics.articles = data;
      }),
      $.getJSON(background.topics.determiners.url, function(data) {
        background.topics.determiners = data;
      }),
      $.getJSON(background.topics.nouns.url, function(data) {
        background.topics.nouns = data;
      })
    )
    .done(function() {
      background.proceedToSetAndToggleToolbar();
    })
    .fail(function() {
      background.createBasicNotification(
        "topics-not-loaded-notification",
        "Topics not loaded!",
        "There was a problem while loading the topics!"
      );
    });
  },

  /**
   * Initiate topics object, so that it can be filled.
   */
  initTopics: function() {
    background.topics.articles = {};

    background.topics.determiners = {};

    background.topics.nouns = {};
  },

  /**
   * Get the URLs of all topic json objects and set them.
   */
  getAndSetTopicURLs: function() {
    background.topics.articles.url = chrome.runtime.getURL("topics/articles.json");

    background.topics.determiners.url = chrome.runtime.getURL("topics/determiners.json");

    background.topics.nouns.url = chrome.runtime.getURL("topics/nouns.json");
  },

  /**
   * Proceed to set the topics and request to toggleOrAdd the toolbar.
   */
  proceedToSetAndToggleToolbar: function() {
    chrome.storage.local.set({topics: background.topics}, background.requestToToggleOrAddToolbar);
  },

  /**
   * Send a request to the content script to call
   * view.toolbar.toggleOrAddToolbar().
   */
  requestToToggleOrAddToolbar: function() {
    chrome.tabs.sendMessage(background.currentTabId, {action: "toggleOrAddToolbar"});
  },

  /**
   * Create a basic notification containing an id, the
   * "basic" type a title and a message.
   *
   * @param {string} id the id
   * @param {string} title the title
   * @param {string} message the message
   */
  createBasicNotification: function(id, title, message) {
    chrome.notifications.create(
      id, {
        "type": "basic",
        "title": title,
        "message": message
      });
  },

  /**
   * Processes all messages received from content scripts and
   * toolbar.js.
   * Sends requests to content scripts toolbar.js or the server
   * depending on the message.
   *
   * @param {*} request the message sent by the calling script
   * @param {Object} sender the MessageSender Object containing sender info
   * @callback sendResponseCallback
   * @param {sendResponseCallback} sendResponse function to call as response
   */
  processMessage: function(request, sender, sendResponse) {
    background.currentTabId = sender.tab.id;

    const action = request.action;

    if (action && background.hasOwnProperty(action)) {
      const parameters = {
        request,
        sender,
        sendResponse
      };
      return background[action](parameters);
    }
    background.createBasicNotification(
      "unhandled-message-notification",
      "Unhandled Message!",
      "There was no handler for message: " + JSON.stringify(request) + "!"
    );
  },

  /**
   * The content script view-menu.js send the message to open the options page.
   */
  openOptionsPage: function() {
    chrome.runtime.openOptionsPage();
  },

  /**
   * The content script view-menu.js send the message to open the help page.
   */
  openHelpPage: function() {
    const url = "http://sifnos.sfs.uni-tuebingen.de/VIEW/index.jsp?content=activities";
    chrome.tabs.create({url: url});
  },

  /**
   * Helper function for ajax post requests.
   *
   * @param {string} url the server url
   * @param {Object} data the data sent to the server
   * @param {number} ajaxTimeout the amount of time given for the server
   * to respond
   *
   * @returns ajax post request to the server with the default options
   */
  ajaxPost: function(url, data, ajaxTimeout) {
    return $.post({
      url: url,
      data: JSON.stringify(data),
      dataType: "text",
      processData: false,
      timeout: ajaxTimeout
    });
  },

  /**
   * Send the activity data from enhancer.js to the
   * server for processing.
   * If successful, request a call of view.enhancer.addEnhancementMarkup(data).
   *
   * @param {object} parameters request, sender and sendResponse from
   * processMessage
   */
  sendActivityDataAndGetEnhancementMarkup: function(parameters) {
    const request = parameters.request;
    const ajaxTimeout = request.ajaxTimeout || 120000;
    chrome.storage.local.get(
      "servletURL",
      function(data) {
        background.ajaxPost(
          data.servletURL,
          request.activityData,
          ajaxTimeout)
        .done(function(data, textStatus, xhr) {
          if (data) {
            background.requestToAddEnhancementMarkup(data);
          } else {
            background.ajaxError(xhr, "nodata");
          }
        })
        .fail(function(xhr, textStatus) {
          background.ajaxError(xhr, textStatus);
        });
      }
    );
  },

  /**
   * Add enhancement markup data from the server by sending a request to the
   * content script to call view.enhancer.addEnhancementMarkup(data).
   *
   * @param {string} data the html markup to be added to the current page
   */
  requestToAddEnhancementMarkup: function(data) {
    chrome.tabs.sendMessage(background.currentTabId, {
      action: "addEnhancementMarkup",
      data: data
    });
  },

  /**
   * Send the task data to the server for processing, get and set
   * the task id obtained from the server.
   *
   * @param {object} parameters request, sender and sendResponse from
   * processMessage
   */
  sendTaskDataAndGetTaskId: function(parameters) {
    chrome.storage.local.get(
      "serverTaskURL",
      function(data) {
        background.ajaxPost(
          data.serverTaskURL,
          parameters.request.taskData,
          10000)
        .done(function(data, textStatus, xhr) {
          if (data) {
            const taskData = JSON.parse(data);
            background.setTaskId(taskData["task-id"]);
          } else {
            background.ajaxError(xhr, "no-task-data");
          }
        })
        .fail(function() {
          background.signOut();
          background.createBasicNotification(
            "auth-token-expired",
            "The auth token expired!",
            "The token for user authentication expired, " +
            "you will be signed out automatically. " +
            "Please sign in again!"
          );
        });
      }
    );
  },

  /**
   * Set the task id to storage.
   *
   * @param {number} taskId the task id from the server
   */
  setTaskId: function(taskId) {
    chrome.storage.local.set({taskId: taskId}, background.noResponse);
  },

  /**
   * Send the tracking data to the server for processing.
   * If successful, request to call
   * view.feedbacker.showFeedback(submissionResponseData).
   *
   * @param {object} parameters request, sender and sendResponse from
   * processMessage
   */
  sendTrackingData: function(parameters) {
    chrome.storage.local.get(
      "serverTrackingURL",
      function(data) {
        background.ajaxPost(
          data.serverTrackingURL,
          parameters.request.trackingData,
          10000)
        .done(function(data, textStatus, xhr) {
          if (data) {
            const submissionResponseData = JSON.parse(data);
            background.requestToShowFeedback(submissionResponseData);
          } else {
            background.ajaxError(xhr, "no-performance-data");
          }
        });
      }
    );
  },

  /**
   * Send a request to the content script to call
   * view.feedbacker.showFeedback(submissionResponseData).
   *
   * @param {Object} submissionResponseData the response from the
   * server after tracking data was processed
   */
  requestToShowFeedback: function(submissionResponseData) {
    chrome.tabs.sendMessage(background.currentTabId, {
      action: "showFeedback",
      submissionResponseData: submissionResponseData
    });
  },

  /**
   * Helper function for ajax get requests.
   *
   * @param {string} url the server url
   * @param {Object} queryParam the query parameter(s)
   * @param {number} ajaxTimeout the amount of time given for the server
   * to respond
   *
   * @returns ajax get request to the server with the default options
   */
  ajaxGet: function(url, queryParam, ajaxTimeout) {
    return $.get({
      url: url + queryParam,
      timeout: ajaxTimeout
    });
  },

  /**
   * Send the request from statistics-menu.js to the
   * server to get all tasks.
   * If successful, request a call of view.statisticsMenu.showAllTasks(data).
   *
   * @param {object} parameters request, sender and sendResponse from
   * processMessage
   */
  getAllTasks: function(parameters) {
    const request = parameters.request;
    const ajaxTimeout = request.ajaxTimeout || 120000;
    background.ajaxGet(request.serverTaskURL,
      request.queryParam,
      ajaxTimeout)
    .done(function(data, textStatus, xhr) {
      if (data) {
        background.requestToShowAllTasks(data);
      } else {
        background.ajaxError(xhr, "no-task-data");
      }
    })
    .fail(function(xhr, textStatus) {
      background.ajaxError(xhr, textStatus);
    });
  },

  /**
   * Send a request to the content script to call
   * view.statisticsMenu.showAllTasks(data).
   *
   * @param {string} tasksData data containing all tasks
   */
  requestToShowAllTasks: function(tasksData) {
    chrome.tabs.sendMessage(background.currentTabId, {
      action: "showAllTasks",
      tasksData: tasksData
    });
  },

  /**
   * Send the request from statistics-menu.js to the
   * server to get a list of performances for a task.
   * If successful, request a call of view.statisticsMenu.showTask(data).
   *
   * @param {object} parameters request, sender and sendResponse from
   * processMessage
   */
  getTask: function(parameters) {
    const request = parameters.request;
    const ajaxTimeout = request.ajaxTimeout || 120000;
    background.ajaxGet(request.serverTrackingURL,
      request.queryParam,
      ajaxTimeout)
    .done(function(data, textStatus, xhr) {
      if (data) {
        background.requestToShowTask(data);
      } else {
        background.ajaxError(xhr, "no-performance-data");
      }
    })
    .fail(function(xhr, textStatus) {
      background.ajaxError(xhr, textStatus);
    });
  },

  /**
   * Send a request to the content script to call
   * view.statisticsMenu.showTask(data).
   *
   * @param {string} performancesData data containing all performances for
   * a task
   */
  requestToShowTask: function(performancesData) {
    chrome.tabs.sendMessage(background.currentTabId, {
      action: "showTask",
      performancesData: performancesData
    });
  },

  /**
   * Fire an ajaxError if anything went wrong when sending data from the
   * extension to the server.
   *
   * @param {Object} xhr the type of error that occurred and an optional
   * exception object, if one occurred
   * @param {string} textStatus besides "null" any of "timeout", "error",
   * "abort", "nodata" and "parsererror"
   */
  ajaxError: function(xhr, textStatus) {
    background.requestToCallInitialInteractionState();

    if (!xhr || !textStatus) {
      background.createBasicNotification(
        "no-xhr-or-textstatus-notification",
        "(!xhr || !textStatus)!",
        "The VIEW server encountered an error."
      );
      return;
    }

    switch (textStatus) {
      case "nodata":
        background.createBasicNotification(
          "nodata-notification",
          "No data!",
          "The VIEW server did not send any data."
        );
        break;
      case "no-task-data":
        background.createBasicNotification(
          "no-task-data-notification",
          "No task data!",
          "The VIEW server did not send any task data."
        );
        break;
      case "no-performance-data":
        background.createBasicNotification(
          "no-performance-data-notification",
          "No performance data!",
          "The VIEW server did not send any performance data."
        );
        break;
      case "timeout":
        background.createBasicNotification(
          "timeout-notification",
          "Timeout!",
          "The VIEW server is taking too long to respond."
        );
        break;
      case "error":
        switch (xhr.status) {
          case 490:
            background.createBasicNotification(
              "error-490-notification",
              "Error 490!",
              "The VIEW server no longer supports this version of the VIEW " +
              "extension.\nPlease check for a new version of the add-on in the " +
              "Tools->Add-ons menu!"
            );
            break;
          case 491:
            background.createBasicNotification(
              "error-491-notification",
              "Error 491!",
              "The topic selected isn't available.\nPlease select a " +
              "different topic from the toolbar menu."
            );
            break;
          case 492:
            background.createBasicNotification(
              "error-492-notification",
              "Error 492!",
              "The topic selected isn't available for the language " +
              "selected.\nPlease select a different language or topic from " +
              "the toolbar menu."
            );
            break;
          case 493:
            background.createBasicNotification(
              "error-493-notification",
              "Error 493!",
              "The server is too busy right now. Please try again " +
              "in a few minutes."
            );
            break;
          case 494:
            // enhancement was stopped on client's request
            break;
          default:
            background.createUnknownErrorNotification();
            break;
        }
        break;
      default:
        background.createUnknownErrorNotification();
        break;
    }
  },

  /**
   * Send a request to the content script to call
   * view.toolbar.initialInteractionState().
   */
  requestToCallInitialInteractionState: function() {
    chrome.tabs.sendMessage(background.currentTabId, {action: "initialInteractionState"});
  },

  /**
   * Create an unknown error notification when no judgement can be made.
   */
  createUnknownErrorNotification: function() {
    background.createBasicNotification(
      "unknown-error-notification",
      "Unknown error!",
      "The VIEW server encountered an unknown error."
    );
  },

  /**
   * Sign in or out the user according to the changes in the
   * user id cookie.
   *
   * @param {Object} changeInfo the object containing information
   * whether the cookie was removed, the cookie itself and the
   * reason for its change
   */
  processUserIdCookie: function(changeInfo) {
    if (changeInfo.removed) {
      background.signOut();
    }
    else if (changeInfo.cookie.value) {
      background.signIn(changeInfo.cookie.value);
    }
    background.requestToSetAccountInfo();
  },

  /**
   * Reset user related information and send a request to the toolbar to
   * sign out the user afterwards.
   */
  signOut: function() {
    chrome.storage.local.set({
      userEmail: "",
      userid: "",
      user: "",
      token: "",
      taskId: ""
    }, background.requestToSignOut);
  },

  /**
   * Send a request to the content script to call view.toolbar.signOut().
   */
  requestToSignOut: function() {
    chrome.tabs.sendMessage(background.currentTabId, {action: "signOut"});
  },

  /**
   * Set user email, user id, and authentication token and send a request to the
   * toolbar to sign in the user.
   *
   * @param {string} userData "/" delimited string with user data:
   * - name
   * - email
   * - id
   * - auth token
   */
  signIn: function(userData) {
    const account = userData.split("/");
    const user = decodeURI(account[0]);
    const userEmail = account[1];
    const userid = account[2];
    const authtoken = account[3];

    chrome.storage.local.set({
      userEmail: userEmail,
      userid: userid,
      user: user,
      token: authtoken
    }, function() {
      background.requestToSignIn(user);
    });
  },

  /**
   * Send a request to the content script to call view.toolbar.signIn().
   */
  requestToSignIn: function(user) {
    chrome.tabs.sendMessage(background.currentTabId, {
      action: "signIn",
      user: user
    });
  },

  /**
   * Send a request to the content script to call view.accountMenu.setAccountInfo().
   */
  requestToSetAccountInfo: function() {
    chrome.tabs.sendMessage(background.currentTabId, {action: "setAccountInfo"});
  }
};

/**
 * Handle the browser action button.
 * Initialize topics, if necessary, and toggleOrAdd the toolbar.
 *
 * @param {number} tab the tab the toolbar
 * is located at
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  background.clickCounter++;

  background.currentTabId = tab.id;

  if (background.clickCounter === 1) {
    background.setDefaults();
    background.setTopics();
  }
  else {
    background.requestToToggleOrAddToolbar();
  }
});

chrome.runtime.onMessage.addListener(background.processMessage);

/**
 * Observe the user id cookie when it changes.
 *
 * @param {Object} changeInfo the object containing information
 * whether the cookie was removed, the cookie itself and the
 * reason for its change
 */
function observeUserId(changeInfo) {
  if ("wertiview_userid" === changeInfo.cookie.name) {
    background.processUserIdCookie(changeInfo);
  }
}

chrome.cookies.onChanged.addListener(observeUserId);
