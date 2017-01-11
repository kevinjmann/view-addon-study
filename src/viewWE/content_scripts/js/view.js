const view = {
  // General options
  serverURL: "https://view.aleks.bg",
  servletURL: "https://view.aleks.bg/view",
  cookie_name: "wertiview_userid",
  cookie_path: "/VIEW/openid",
  ajaxTimeout: 60000,
  topics: {},
  userEmail: "",
  userid: "",

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
  // e.g. topic = "RusNouns", topic name = "rusnouns"
  topicName: "unselected",

  /**
   * Save general options to the storage
   * and retrieve changed options.
   */
  saveGeneralOptions: function() {
    chrome.runtime.sendMessage({
        msg: "call sendTopics"
      }, function(response) {
        chrome.storage.local.get([
          "userEmail",
          "userid",
          "enabled"
        ], function(storageItems) {
          view.topics = response.topics;
          view.setAllGeneralOptions(storageItems);
        });
      }
    );
  },

  /**
   * Set all options, including eventually changed
   * ones from storage.
   *
   * @param  {object} storageItems changeable items from storage
   */
  setAllGeneralOptions: function(storageItems) {
    view.setFixedGeneralOptions();
    view.setMutableGeneralOptions(storageItems);
  },

  /**
   * Set all general options that aren't changeable.
   */
  setFixedGeneralOptions: function() {
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
   * @param  {object} storageItems changeable items from storage
   */
  setMutableGeneralOptions: function(storageItems) {
    view.setEmailAndId(storageItems.userEmail, storageItems.userid);
    view.setAutoEnhance(storageItems.enabled);
  },

  /**
   * Set user email and id.
   *
   * @param email the email address from the user
   * @param id the user id
   */
  setEmailAndId: function(email, id) {
    if (id == undefined) {
      chrome.storage.local.set({
        userEmail: view.userEmail,
        userid: view.userid
      });
    }
    else {
      view.userEmail = email;
      view.userid = id;
    }
  },

  /**
   * Set whether a page should be enhanced on the spot or not.
   *
   * @param enabled true if the page should be auto enhanced, false otherwise
   */
  setAutoEnhance: function(enabled) {
    if (enabled == undefined) {
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
      "enabled",
      "language",
      "topic",
      "activity"
    ], function(storageItems) {
      view.saveUserOptions(storageItems);

      view.saveSelections(storageItems);

      view.topicName = view.interaction.getTopicName(view.topic);

      view.interaction.enhance();
    });
  },

  /**
   * Save all user options from the options page.
   *
   * @param {object} storageItems the storage items
   */
  saveUserOptions: function(storageItems) {
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
  saveSelections: function(storageItems) {
    view.enabled = storageItems.enabled;
    view.language = storageItems.language;
    view.topic = storageItems.topic;
    view.activity = storageItems.activity;
  }
};