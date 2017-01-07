var view = {
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

  /*
   * Save general options to the storage.
   * This options can't be changed by the user.
   */
  saveGeneralOptions: function() {
    console.log("saveGeneralOptions()");
    chrome.runtime.sendMessage({
        msg: "call sendTopics"
      }, function(response) {
        console.log("received response: got topics JSON object.");
        chrome.storage.local.get([
          "userEmail",
          "userid",
          "enabled"
        ], function(res) {
          view.topics = response.topics;
          chrome.storage.local.set({
            serverURL: view.serverURL,
            servletURL: view.servletURL,
            cookie_name: view.cookie_name,
            cookie_path: view.cookie_path,
            ajaxTimeout: view.ajaxTimeout
          });
          // set the user email and user id
          if (res.userid == undefined) { //  to the default
            chrome.storage.local.set({
              userEmail: view.userEmail,
              userid: view.userid
            });
          }
          else { // to the stored values
            view.userEmail = res.userEmail;
            view.userid = res.userid;
          }

          // set the enabled auto-run true/false option
          if (res.enabled == undefined) { // to the default
            chrome.storage.local.set({
              enabled: view.enabled
            });
          }
        });
      }
    );
  },

  /**
   * Save all user options from the options page.
   *
   * @param {object} storageItems the storage items
   */
  saveUserOptions: function(storageItems) {
    console.log("saveUserOptions()");
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

  /*
   * Initialize all user options and make them accessible to VIEW.
   * Afterwards start enhancing.
   */
  startToEnhance: function() {
    console.log("startToEnhance()");
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
    ], function(storageItems) {// TODO: this should be handled in the toolbar instead
      // save user options, as they might have changed
      view.saveUserOptions(storageItems);

      // enabled, language, topic and activity selections (default)
      view.enabled = storageItems.enabled;
      view.language = storageItems.language;
      view.topic = storageItems.topic;
      view.activity = storageItems.activity;

      // set the topic name
      view.topicName = view.interaction.getTopicName(view.topic);

      // start enhancing the page
      view.interaction.enhance();
    });
  }
};

/*
 * Processes all messages received from background.js.
 * Sends requests to backround.js or handles requests here.
 */
function processMessageForView(request, sender, sendResponse) {
  switch (request.msg) {
    case "call startToEnhance":
      console.log("startToEnhance: received '" + request.msg + "'");
      // initialize the user options and save them globally
      view.startToEnhance();
  }
}

chrome.runtime.onMessage.addListener(processMessageForView);