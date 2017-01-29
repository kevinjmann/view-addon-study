const view = {
  $cache: new Selector_Cache(),

  // General options
  serverURL: "https://view.aleks.bg",
  servletURL: "https://view.aleks.bg/view",
  serverSessionURL: "https://view.aleks.bg/act/newSession",
  serverTrackingURL: "https://view.aleks.bg/act/track",
  cookie_name: "wertiview_userid",
  cookie_path: "/VIEW/openid",
  ajaxTimeout: 60000,
  topics: {},
  userEmail: "",
  userid: "",

  // session data
  user: "Eduard",
  token: "authtoken",
  url: document.baseURI,
  timestamp: "",
  numberOfExercises: 0,
  sessionid: "",

  // user options (defaults)
  fixedOrPercentage: 0,
  fixedNumberOfExercises: 25,
  percentageOfExercises: 100,
  choiceMode: 0,
  firstOffset: 0,
  intervalSize: 1,
  showInst: false,

  // enabled, language, topic and activity selections (default)
  enabled: false, // should the page be enhanced right away?
  language: "unselected",
  topic: "unselected",
  activity: "unselected",

  // the topic name which is used to call the topic modules
  // e.g. topic = "articles", topic name = "pos"
  topicName: "unselected",

  /**
   * Save general options to the storage
   * and retrieve changed options.
   */
  setGeneralOptions: function() {
    chrome.runtime.sendMessage({
        msg: "call sendTopics"
      }, function(response) {
        chrome.storage.local.get([
          "userEmail",
          "userid",
          "user",
          "token",
          "enabled"
        ], function(storageItems) {
          view.setAllGeneralOptions(storageItems, response.topics);
        });
      }
    );
  },

  /**
   * Set all options, including eventually changed
   * ones from storage.
   *
   * @param {object} storageItems changeable items from storage
   * @param {object} topics data from all topics
   */
  setAllGeneralOptions: function(storageItems, topics) {
    view.setFixedGeneralOptions(topics);
    view.setMutableGeneralOptions(storageItems);
  },

  /**
   * Set all general options that aren't changeable.
   *
   * @param {object} topics data from all topics
   */
  setFixedGeneralOptions: function(topics) {
    view.topics = topics;

    chrome.storage.local.set({
      serverURL: view.serverURL,
      servletURL: view.servletURL,
      cookie_name: view.cookie_name,
      cookie_path: view.cookie_path,
      ajaxTimeout: view.ajaxTimeout
    });
  },

  /**
   * Set all general options that can be changed during runtime.
   *
   * @param {object} storageItems changeable items from storage
   */
  setMutableGeneralOptions: function(storageItems) {
    view.setAuthenticationDetails(storageItems);
    view.setAutoEnhance(storageItems.enabled);
  },

  /**
   * Set authentication details:
   * - userid
   * - userEmail
   * - user
   * - token
   *
   * @param {object} storageItems changeable items from storage
   */
  setAuthenticationDetails: function(storageItems) {
    if (storageItems.userid === undefined) {
      chrome.storage.local.set({
        userEmail: view.userEmail,
        userid: view.userid,
        user: view.user,
        token: view.token
      });
    }
    else {
      view.userEmail = storageItems.userEmail;
      view.userid = storageItems.userid;
      view.user = storageItems.user;
      view.token = storageItems.token;
    }
  },

  /**
   * Set whether a page should be enhanced on the spot or not.
   *
   * @param enabled true if the page should be auto enhanced, false otherwise
   */
  setAutoEnhance: function(enabled) {
    if (enabled === undefined) {
      chrome.storage.local.set({enabled: view.enabled});
    }
  },

  /**
   * Initialize all user options and make them accessible to VIEW.
   * Afterwards start enhancing.
   */
  startToEnhance: function() {
    chrome.storage.local.get([
      "fixedOrPercentage",
      "fixedNumberOfExercises",
      "percentageOfExercises",
      "choiceMode",
      "firstOffset",
      "intervalSize",
      "showInst",
      "userEmail",
      "userid",
      "user",
      "token",
      "timestamp",
      "enabled",
      "language",
      "topic",
      "activity"
    ], function(storageItems) {
      view.setUserOptions(storageItems);

      view.setAuthenticationDetails(storageItems);

      view.setSelections(storageItems);

      view.setTimestamp(storageItems.timestamp);

      view.topicName = view.interaction.getTopicName(storageItems.topic);

      view.interaction.enhance();
    });
  },

  /**
   * Set all user options from the options page.
   *
   * @param {object} storageItems the storage items
   */
  setUserOptions: function(storageItems) {
    if (storageItems.fixedOrPercentage !== undefined) {
      view.fixedOrPercentage = storageItems.fixedOrPercentage;
      view.fixedNumberOfExercises = storageItems.fixedNumberOfExercises;
      view.percentageOfExercises = storageItems.percentageOfExercises;
      view.choiceMode = storageItems.choiceMode;
      view.firstOffset = storageItems.firstOffset;
      view.intervalSize = storageItems.intervalSize;
      view.showInst = storageItems.showInst;
    }
  },

  /**
   * Set all user selections.
   *
   * @param {object} storageItems the storage items
   */
  setSelections: function(storageItems) {
    view.enabled = storageItems.enabled;
    view.language = storageItems.language;
    view.topic = storageItems.topic;
    view.activity = storageItems.activity;
  },

  /**
   * Set the timestamp.
   *
   * @param {number} timestamp the time stamp
   */
  setTimestamp: function(timestamp) {
    view.timestamp = timestamp;
  },

  /**
   * Set the number of exercises.
   *
   * @param {number} numberOfExercises the number of exercises
   */
  setNumberOfExercises: function(numberOfExercises) {
    view.numberOfExercises = numberOfExercises;
  },

  /**
   * Send a request to the background script to send session data
   * and get the session id.
   */
  requestToSendSessionDataAndGetSessionId: function() {
    const sessionData = view.createSessionData();

    chrome.runtime.sendMessage({
      msg: "send sessionData and get sessionId",
      sessionData: sessionData,
      serverSessionURL: view.serverSessionURL
    }, view.lib.noResponse);
  },

  /**
   * Create session data to be send to the server.
   *
   * @returns {object} the data of the current session
   */
  createSessionData: function() {
    return {
      user: view.user,
      token: view.token,
      url: view.url,
      language: view.language,
      topic: view.topic,
      activity: view.activity,
      timestamp: view.timestamp,
      "number-of-exercises": view.numberOfExercises
    };
  },

  /**
   * Set the session id obtained from the server whenever a new
   * session was started by the user.
   *
   * @param {string} sessionId the session id from the server
   */
  setSessionId: function(sessionId) {
    view.sessionid = sessionId
  }
};