/** @namespace */
const background = {
  currentTabId: -1,
  clickCounter: 0,
  topics: {},
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
    .fail(function(){
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
  initTopics: function(){
    background.topics.articles = {};

    background.topics.determiners = {};

    background.topics.nouns = {};
  },

  /**
   * Get the URLs of all topic json objects and set them.
   */
  getAndSetTopicURLs: function(){
    background.topics.articles.url = chrome.extension.getURL("topics/articles.json");

    background.topics.determiners.url = chrome.extension.getURL("topics/determiners.json");

    background.topics.nouns.url = chrome.extension.getURL("topics/nouns.json");
  },

  /**
   * Proceed to set the topics and toggle the toolbar.
   */
  proceedToSetAndToggleToolbar : function(){
    chrome.storage.local.set({topics: background.topics}, background.toggleToolbar);
  },

  /**
   * Create a basic notification containing an id, the
   * "basic" type a title and a message.
   *
   * @param {string} id the id
   * @param {string} title the title
   * @param {string} message the message
   */
  createBasicNotification: function(id, title, message){
    chrome.notifications.create(
      id, {
      "type": "basic",
      "title": title,
      "message": message
    });
  },

  /**
   * There was a request to toggle the toolbar.
   * Pass it on to interaction.js.
   */
  toggleToolbar: function() {
    chrome.tabs.sendMessage(background.currentTabId, {msg: "toggle toolbar"});
  },

  /**
   * The toolbar ui send the message to toggle the VIEW menu.
   * Pass it on to interaction.js.
   */
  toggleVIEWMenu: function() {
    chrome.tabs.sendMessage(background.currentTabId, {msg: "toggle VIEW Menu"});
  },

  /**
   * The toolbar ui send the message to hide the VIEW menu.
   * Pass it on to interaction.js.
   */
  hideVIEWMenu: function() {
    chrome.tabs.sendMessage(background.currentTabId, {msg: "hide VIEW Menu"});
  },

  /**
   * The toolbar ui send the message to call startToEnhance().
   * Pass it on to view.js.
   */
  callStartToEnhance: function() {
    chrome.tabs.sendMessage(background.currentTabId, {msg: "call startToEnhance"});
  },

  /**
   * Interaction.js send the message to show/hide an element
   * using a selector. Pass it on to toolbar.js.
   *
   * @param {*} request the message sent by the calling script
   */
  showHideElement: function(request) {
    chrome.tabs.sendMessage(background.currentTabId, {
      msg: request.msg,
      selector: request.selector
    });
  },

  /**
   * toolbar.js/view.js is ready to receive the topics. Send them to it.
   *
   * @callback sendResponseCallback
   * @param {sendResponseCallback} sendResponse function to call as response
   */
  sendTopics: function(sendResponse) {
    sendResponse({topics: background.topics});
  },

  /**
   * The toolbar ui send the message to call abort().
   * Pass it on to interaction.js.
   */
  callAbort: function() {
    chrome.tabs.sendMessage(background.currentTabId, {msg: "call abort"});
  },

  /**
   * The toolbar ui send the message to call restoreToOriginal().
   * Pass it on to interaction.js.
   */
  callRestoreToOriginal: function() {
    chrome.tabs.sendMessage(background.currentTabId, {msg: "call restoreToOriginal"});
  },

  /**
   * Redirects to the given link in the request.
   *
   * @param {string} link the link to redirect to
   */
  redirect: function(link) {
    chrome.tabs.create({url: link});
  },
  
  /**
   * The toolbar ui send the message to open the options page.
   */
  callOpenOptionsPage: function() {
    chrome.runtime.openOptionsPage();
  },

  /**
   * The toolbar ui send the message to open the help page.
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
   * Send the activity data from interaction.js to the
   * server for processing.
   * If successful, request a call of addServerMarkup
   * in interaction.js.
   *
   * @param {*} request the message sent by the calling script
   */
  sendActivityData: function(request) {
    const ajaxTimeout = request.ajaxTimeout || 120000;
    background.ajaxPost(request.servletURL,
      request.activityData,
      ajaxTimeout)
    .done(function(data, textStatus, xhr) {
      if (data) {
        background.callAddServerMarkup(data);
      } else {
        background.ajaxError(xhr, "nodata");
      }
    })
    .fail(function(xhr, textStatus) {
      background.ajaxError(xhr, textStatus);
    });
  },

  /**
   * Send html markup data from the server to interaction.js so that
   * the addServerMarkup method there will be called.
   *
   * @param {string} data the html markup to be added to the current page
   */
  callAddServerMarkup: function(data){
    chrome.tabs.sendMessage(background.currentTabId, {
      msg: "call addServerMarkup",
      data: data
    });
  },

  /**
   * Send the task data from view.js to the server for processing.
   * If successful, request to call setTaskId in view.js.
   *
   * @param {*} request the message sent by the calling script
   */
  sendTaskDataAndGetTaskId: function(request){
    background.ajaxPost(request.serverTaskURL,
      request.taskData,
      10000)
    .done(function(data, textStatus, xhr) {
      if (data) {
        const jsObject = JSON.parse(data);
          background.callSetTaskId(jsObject["task-id"]);
      } else {
        background.ajaxError(xhr, "no-task-id");
      }
    })
    .fail(function() {
      background.signOutUser();
      background.createBasicNotification(
        "auth-token-expired",
        "The auth token expired!",
        "The token for user authentication expired, " +
        "you will be signed out automatically. " +
        "Please sign in again!"
      );
    });
  },

  /**
   * Request to call setTaskId(taskId) in view.js.
   *
   * @param {number} taskId the task id from the server
   */
  callSetTaskId: function(taskId) {
    chrome.tabs.sendMessage(background.currentTabId, {
      msg: "call setTaskId",
      taskId: taskId
    });
  },

  /**
   * Send the interaction data to the server for processing.
   *
   * @param {*} request the message sent by the calling script
   */
  sendInteractionData: function(request) {
    background.ajaxPost(request.serverTrackingURL,
      request.interactionData,
      10000);
  },

  /**
   * Send the request data from interaction.js to the
   * server for processing.
   * If successful, request a call of saveDataAndInsertSpans
   * in interaction.js.
   *
   * @param {*} request the message sent by the calling script
   */
  sendRequestDataAbort: function(request) {
    const ajaxTimeout = request.ajaxTimeout || 120000;
    background.ajaxPost(request.servletURL,
      request.requestData,
      ajaxTimeout)
    .done(function() {
      background.callAbortEnhancement();
    });
  },

  /**
   * Send a request to the content script to call abortEnhancement().
   */
  callAbortEnhancement: function(){
    chrome.tabs.sendMessage(background.currentTabId, {msg: "call abortEnhancement"});
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
    background.callInitialInteractionState();

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
      case "no-task-id":
        background.createBasicNotification(
          "no-task-id-notification",
          "No task id!",
          "The VIEW server did not send the task id."
        );
        break;
      case "timeout":
        background.createBasicNotification(
          "timeout-notification",
          "Timeout!",
          "The VIEW server is taking too long to respond."
        );
        // when the add-on has timed out, tell the server to stop
        background.callAbortEnhancement();
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
   * Send a request to the content script to return to the initial interaction
   * state.
   */
  callInitialInteractionState: function(){
    chrome.tabs.sendMessage(background.currentTabId, {msg: "call initialInteractionState"});
  },

  /**
   * Create an unknown error notification when no judgement can be made.
   */
  createUnknownErrorNotification: function(){
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
  processUserIdCookie: function(changeInfo){
    if (changeInfo.removed) {
      background.signOutUser();
    }
    else if(changeInfo.cookie.value){
      background.signInUser(changeInfo.cookie.value);
    }
  },

  /**
   * Reset user email and user id and send a request to the toolbar to
   * sign out the user afterwards.
   */
  signOutUser: function(){
    chrome.storage.local.set({
      userEmail: "",
      userid: "",
      user: "",
      token: ""
    }, function() {
      chrome.tabs.sendMessage(background.currentTabId, {msg: "call signOut"});
    });
  },

  /**
   * Set user email, user id, and authentication token and send a request to the
   * toolbar to sign in the user.
   *
   * @param {string} userData "/" delimited string with user data:
   * - name
   * - email
   * - id
   */
  signInUser: function(userData){
    const account = userData.split("/");
    const user = account[0];
    const userEmail = account[1];
    const userid = account[2];
    const authtoken = account[3];

    chrome.storage.local.set({
      userEmail: userEmail,
      userid: userid,
      user: user,
      token: authtoken
    }, function() {
      chrome.tabs.sendMessage(background.currentTabId, {
        msg: "call signIn",
        userEmail: userEmail
      });
    });
  }
};

/**
 * Handle the browser action button.
 * Initialize topics, if necessary, and toggle the toolbar.
 *
 * @param {number} tab the tab the toolbar
 * is located at
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  background.clickCounter++;

  background.currentTabId = tab.id;

  if (background.clickCounter === 1) {
    background.setTopics();
  }
  else {
    background.toggleToolbar();
  }
});

/**
 * Processes all messages received from interaction.js and toolbar.js.
 * Sends requests to interaction.js, toolbar.js or the server depending on the
 * message.
 *
 * @param {*} request the message sent by the calling script
 * @param {Object} sender the MessageSender Object containing sender info
 * @callback sendResponseCallback
 * @param {sendResponseCallback} sendResponse function to call as response
 */
function processMessage(request, sender, sendResponse) {
  background.currentTabId = sender.tab.id;

  switch (request.msg) {
    case "toggle toolbar":
      background.toggleToolbar();
      break;
    case "toggle VIEW Menu":
      background.toggleVIEWMenu();
      break;
    case "hide VIEW Menu":
      background.hideVIEWMenu();
      break;
    case "call startToEnhance":
      background.callStartToEnhance();
      break;
    case "show element":
    case "hide element":
      background.showHideElement(request);
      break;
    case "call sendTopics":
      background.sendTopics(sendResponse);
      break;
    case "call abort":
      background.callAbort();
      break;
    case "call restoreToOriginal":
      background.callRestoreToOriginal();
      break;
    case "redirect to link":
      background.redirect(request.link);
      break;
    case "call openOptionsPage":
      background.callOpenOptionsPage(sender.tab.id);
      break;
    case "open help page":
      background.openHelpPage();
      break;
    case "send activityData":
      background.sendActivityData(request);
      break;
    case "send taskData and get taskId":
      background.sendTaskDataAndGetTaskId(request);
      break;
    case "send interactionData":
      background.sendInteractionData(request);
      break;
    case "send requestData abort":
      background.sendRequestDataAbort(request);
      break;
    default:
      background.createBasicNotification(
        "unhandled-message-notification",
        "Unhandled Message!",
        "There was an unhandled message!"
      );
  }
}

chrome.runtime.onMessage.addListener(processMessage);

/**
 * Observe the user id cookie when it changes.
 *
 * @param {Object} changeInfo the object containing information
 * whether the cookie was removed, the cookie itself and the
 * reason for its change
 */
function observeUserId(changeInfo) {
  if (changeInfo.cookie.name == "wertiview_userid") {
    background.processUserIdCookie(changeInfo);
  }
}

chrome.cookies.onChanged.addListener(observeUserId);
