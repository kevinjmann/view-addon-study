/**
 * From: https://gist.github.com/jtsternberg/1e03f5fd5be8427170c5
 * Caches jquery selectors when they are requested, so that each element
 * is only selected once. An element can be reset, if necessary.
 * For selectors like $(this) in e.g. selection menus you should always
 * reset the element or don't use it at all.
 * Be careful of selections that won't stay the same.
 *
 * @returns {{get: get_from_cache}} use: let cache = new Selector_Cache();
 * cache.get(selector) or
 * cache.get(selector, true) if the selected element should be reset
 * @constructor initialized with: new Selector_Cache()
 */
function Selector_Cache() {
  const collection = {};

  function get_from_cache(selector, reset) {
    if (undefined === collection[selector] || true === reset) {
      collection[selector] = $(selector);
    }

    return collection[selector];
  }

  return {get: get_from_cache};
}


const toolbar = {
  topics: {},

  $cache: new Selector_Cache(),

  selectorStart: "#wertiview-toolbar-",

  /**
   * Send a request to the background script to send the topics.
   * After they are received we start to initialize the toolbar.
   */
  requestTopicsAndInit: function() {
    chrome.runtime.sendMessage({msg: "call sendTopics"}, function(response) {
      toolbar.init(response.topics);
    });
  },

  /**
   * Initialization of the toolbar when the browser action button
   * is clicked and active event handlers on the toolbar.
   *
   * @param {Object} topics info on topics obtained from the topics json files
   */
  init: function(topics) {
    toolbar.topics = topics;

    toolbar.initViewMenu();

    toolbar.initAutoEnhance();

    toolbar.initLanguageMenu();

    toolbar.initTopicMenu();

    toolbar.initialInteractionState();

    toolbar.initEnhanceBtn();

    toolbar.initAbortBtn();

    toolbar.initRestoreBtn();

    toolbar.initSignInOutInterfaces();

    toolbar.initSignInLink();

    toolbar.initSignOutLink();

    toolbar.initToggleToolbar();

    toolbar.restoreSelections();
  },

  /**
   * Init the view menu handler. Toggle between hiding and showing
   * the drop down content on click.
   */
  initViewMenu: function() {
    toolbar.$cache.get("#wertiview-VIEW-menu-btn").on("click",
      toolbar.requestToToggleMenuView);
  },

  /**
   * Send a request to the background script to pass on the message to
   * toggle the VIEW menu.
   */
  requestToToggleMenuView: function() {
    chrome.runtime.sendMessage({msg: "toggle Menu VIEW"}, toolbar.noResponse);
  },

  /**
   * A function that is supposed to be a placeholder for a response callback.
   */
  noResponse: function() {
    // This is intentional
  },

  /**
   * Init the handler for the auto enhance enabled/disabled buttons.
   * A click on the enabled button will hide it and show the disabled button
   * and vice versa.
   */
  initAutoEnhance: function() {
    toolbar.$cache.get(toolbar.selectorStart + "enabled").on("click",
      toolbar.turnOffAutoEnhanceAndSet);

    toolbar.$cache.get(toolbar.selectorStart + "disabled").on("click",
      toolbar.turnOnAutoEnhanceAndSet);
  },

  /**
   * Turn off auto enhance and set enabled to "false".
   */
  turnOffAutoEnhanceAndSet: function() {
    toolbar.turnOffAutoEnhance();
    chrome.storage.local.set({enabled: false});
  },

  /**
   * Turn off auto enhance by hiding the enabled button
   * and showing the disabled button.
   */
  turnOffAutoEnhance: function() {
    toolbar.$cache.get(toolbar.selectorStart + "enabled").hide();
    toolbar.$cache.get(toolbar.selectorStart + "disabled").show();
  },

  /**
   * Turn on auto enhance and set enabled to "true".
   */
  turnOnAutoEnhanceAndSet: function() {
    toolbar.turnOnAutoEnhance();
    chrome.storage.local.set({enabled: true});
  },

  /**
   * Turn on auto enhance by hiding the disabled button
   * and showing the enabled button.
   */
  turnOnAutoEnhance: function() {
    toolbar.$cache.get(toolbar.selectorStart + "disabled").hide();
    toolbar.$cache.get(toolbar.selectorStart + "enabled").show();
  },

  /**
   * Init the handler for the language menu selection box.
   * Select the topic menu according to the language on change.
   */
  initLanguageMenu: function() {
    toolbar.$cache.get(toolbar.selectorStart + "language-menu").on("change", function() {
      toolbar.selectTopicMenu($(this).val());
    });
  },

  /**
   * Select the topic menu according to the language option.
   * Hide all other topic menus.
   *
   * @param {string} language the language selected by the user
   */
  selectTopicMenu: function(language) {
    toolbar.$cache.get(toolbar.selectorStart + "language-menu").find("option").each(function() {
      toolbar.toggleTopicMenu(language, $(this).val());
    });
  },

  /**
   * Toggles the topic menu in question according to the selected language
   * and the current language option. If they are equal the topic menu will
   * be shown, otherwise it will be hidden.
   *
   * @param {string} selectedLanguage the language selected by the user
   * @param {string} currentLanguage any of the language options
   */
  toggleTopicMenu: function(selectedLanguage, currentLanguage) {
    const $topicMenu = toolbar.$cache.get(toolbar.selectorStart + "topic-menu-" + currentLanguage);
    const selectedTopicMenu = "selected-toolbar-topic-menu";

    if (selectedLanguage === currentLanguage) {
      $topicMenu.addClass(selectedTopicMenu).show();
      toolbar.updateActivities(selectedLanguage, $topicMenu.val());
    } else {
      $topicMenu.removeClass(selectedTopicMenu).hide();
    }
  },

  /**
   * Update activities when the topic is changed. Enable activities available
   * to the topic and disable the ones that aren't.
   * Activity "Pick an Activity" is always enabled, selected and visible.
   *
   * @param language the current language
   * @param topic the current topic
   */
  updateActivities: function(language, topic) {
    const activitySelectors = toolbar.fillActivitySelectors();
    const unselected = "unselected";
    const undefinedType = "undefined";

    activitySelectors[unselected].prop("disabled", false).prop("selected", true).show();

    if (
      language == unselected ||
      topic.startsWith(unselected) ||
      typeof toolbar.topics[language] === undefinedType ||
      typeof toolbar.topics[language][topic] === undefinedType) {
      activitySelectors[unselected].next().hide();
    }
    else {
      toolbar.enableAndShowActivities(language, topic, activitySelectors);
    }
  },

  /**
   * Fill up the activity selectors, disable and hide all activities.
   *
   * @returns {Object} all activity selectors
   */
  fillActivitySelectors: function() {
    let activitySelectors = {};

    toolbar.$cache.get(toolbar.selectorStart + "activity-menu").find("option[value]").each(function() {
      const currentActivity = $(this).val();
      activitySelectors[currentActivity] =
        $(toolbar.selectorStart + "activity-" + currentActivity).prop("disabled", true).hide();
    });
    return activitySelectors;
  },

  /**
   * Enable and show only activities that are available for the language and
   * topic combination. Show the horizontal separator.
   *
   * @param {string} language the selected language
   * @param {string} topic the selected topic
   * @param {Array} activitySelectors the object of jquery selectors for each
   * activity
   */
  enableAndShowActivities: function(language, topic, activitySelectors) {
    activitySelectors["unselected"].next().show();

    const availableActivities = toolbar.topics[language][topic].activities;

    for (let i = 0; i < availableActivities.length; i++) {
      activitySelectors[availableActivities[i].activity].prop("disabled", false).show();
    }
  },

  /**
   * Init the handler for the topic menu selection box.
   * Update the activities according to language and topic on change.
   */
  initTopicMenu: function() {
    toolbar.$cache.get(
      toolbar.selectorStart + "topic-menu-unselected, " +
      toolbar.selectorStart + "topic-menu-en, " +
      toolbar.selectorStart + "topic-menu-de, " +
      toolbar.selectorStart + "topic-menu-es, " +
      toolbar.selectorStart + "topic-menu-ru").on("change", function() {
      const language = toolbar.$cache.get(toolbar.selectorStart + "language-menu").val();
      const topic = $(this).val();

      toolbar.updateActivities(language, topic);
    });
  },

  /**
   * Returns to initial interaction state, where the loading image, abort
   * and restore button are hidden and the enhance button is enabled.
   */
  initialInteractionState: function() {
    toolbar.$cache.get(toolbar.selectorStart + "enhance-button").show();
    toolbar.$cache.get(toolbar.selectorStart + "restore-button").hide();
    toolbar.$cache.get(toolbar.selectorStart + "abort-button").hide();
    toolbar.$cache.get(toolbar.selectorStart + "loading-image").hide();
  },

  /**
   * Init the handler for the enhance button.
   * Call setSelectionsAndPrepareToEnhance() on click.
   */
  initEnhanceBtn: function() {
    toolbar.$cache.get(toolbar.selectorStart + "enhance-button").on("click",
      toolbar.setSelectionsAndPrepareToEnhance);
  },

  /**
   * Set language, topic and activity, if none of them are "unselected".
   * Afterwards prepare to enhance the page.
   * Otherwise create a unselected notification for the user.
   */
  setSelectionsAndPrepareToEnhance: function() {
    const language = toolbar.$cache.get(toolbar.selectorStart + "language-menu").val();
    const topic = toolbar.$cache.get(".selected-toolbar-topic-menu").val();
    const activity = toolbar.$cache.get(toolbar.selectorStart + "activity-menu").val();
    const unselected = "unselected";

    if (language.startsWith(unselected) ||
      topic.startsWith(unselected) ||
      activity.startsWith(unselected)) {
      chrome.runtime.sendMessage({msg: "create unselectedNotification"}, toolbar.noResponse);
    }
    else{
      chrome.storage.local.set({
        language: language,
        topic: topic,
        activity: activity
      }, toolbar.prepareToEnhance);
    }
  },

  /**
   * Disable enhance and restore button, show spinning wheel.
   * Send a request to the background script to pass on the
   * message to call startToEnhance().
   */
  prepareToEnhance: function() {
    toolbar.$cache.get(toolbar.selectorStart + "enhance-button").hide();
    toolbar.$cache.get(toolbar.selectorStart + "restore-button").hide();
    toolbar.$cache.get(toolbar.selectorStart + "loading-image").show();

    chrome.runtime.sendMessage({msg: "call startToEnhance"}, toolbar.noResponse);
  },

  /**
   * Init the handler for the abort button.
   * Call requestToCallAbort() on click.
   */
  initAbortBtn: function() {
    toolbar.$cache.get(toolbar.selectorStart + "abort-button").on("click",
      toolbar.requestToCallAbort);
  },

  /**
   * Send a request to the background script to pass on the
   * message to call abort().
   */
  requestToCallAbort: function() {
    chrome.runtime.sendMessage({msg: "call abort"}, toolbar.noResponse);
  },

  /**
   * Init the handler for the restore button.
   * Call requestToCallRestoreToOriginal() on click.
   */
  initRestoreBtn: function() {
    toolbar.$cache.get(toolbar.selectorStart + "restore-button").on("click",
      toolbar.requestToCallRestoreToOriginal);
  },

  /**
   * Send a request to the background script to pass on the
   * message to call restoreToOriginal().
   */
  requestToCallRestoreToOriginal: function() {
    chrome.runtime.sendMessage({msg: "call restoreToOriginal"}, toolbar.noResponse);
  },

  /**
   * Set the href attribute for the identity sign-in/out link.
   */
  initSignInOutInterfaces: function() {
    //chrome.storage.local.get("serverURL", function(res) {
      //var link = res.serverURL + "/openid/authenticator.html";
      // TODO: hardcoded, implement authenticator.html on this server
    //});
    const link = "http://sifnos.sfs.uni-tuebingen.de/VIEW/openid/authenticator.html";
    toolbar.$cache.get(toolbar.selectorStart + "identity-signinlink").attr("link", link);
    toolbar.$cache.get(toolbar.selectorStart + "identity-signoutlink").attr("link", link);
  },

  /**
   * Init the handler for the sign in link.
   * Call openSignInWinodow() on click.
   */
  initSignInLink: function() {
    toolbar.$cache.get(toolbar.selectorStart + "identity-signinlink").on("click", 
      toolbar.openSignInWindow);
  },

  /**
   * Use the sign in link to open the authenticator sign in window.
   */
  openSignInWindow: function() {
    window.open(
      toolbar.$cache.get(toolbar.selectorStart + "identity-signinlink").attr("link"),
      "Sign In",
      "width=985,height=735").focus();
  },

  /**
   * Init the handler for the sign out link.
   * Call openSignOutWindow() on click.
   */
  initSignOutLink: function() {
    toolbar.$cache.get(toolbar.selectorStart + "identity-signoutlink").on("click",
      toolbar.openSignOutWindow);
  },

  /**
   * Use the sign out link to open the authenticator sign out window.
   */
  openSignOutWindow: function() {
    window.open(
      toolbar.$cache.get(toolbar.selectorStart + "identity-signoutlink").attr("link"),
      "Sign Out",
      "width=1,height=1").moveTo(0, window.screen.availHeight + 1000);
  },

  /**
   * Init the handler for the "X" button.
   * Call requestToToggleToolbar() on click.
   */
  initToggleToolbar: function() {
    toolbar.$cache.get(toolbar.selectorStart + "toggle-button").on("click",
      toolbar.requestToToggleToolbar);
  },

  /**
   * Send a request to the background script to pass on the
   * message to toggle the toolbar.
   */
  requestToToggleToolbar: function() {
    chrome.runtime.sendMessage({msg: "toggle toolbar"}, toolbar.noResponse);
  },

  /**
   * Restores all selections from language, topic and activity.
   * Restore auto-run option (enabled/disabled).
   * The values right to "||" are default values.
   */
  restoreSelections: function() {
    chrome.storage.local.get([
      "language",
      "topic",
      "activity",
      "userEmail",
      "enabled"], function(res) {
      const language = res.language || "unselected";
      const topic = res.topic || "unselected";
      const activity = res.activity || "unselected";
      const userEmail = res.userEmail || "";
      const enabled = res.enabled || false;

      toolbar.restoreSelectionMenus(language, topic, activity);

      toolbar.selectTopicMenu(language);

      toolbar.verifySignInStatus(userEmail);

      toolbar.restoreAutoEnhance(enabled);
    });
  },

  /**
   * Restore all selections of the selection menus.
   *
   * @param {string} language the stored language
   * @param {string} topic the stored topic
   * @param {string} activity the stored activity
   */
  restoreSelectionMenus: function(language, topic, activity) {
    const selected = "selected";

    toolbar.$cache.get(toolbar.selectorStart + "language-" + language).prop(selected, true);

    const topicMenu = toolbar.selectorStart + "topic-" + topic;

    // special case Dets and Preps are shared between en, de and es
    if (topic == "determiners" || topic == "Preps") {
      toolbar.$cache.get(topicMenu + "-" + language).prop(selected, true);
    }
    else {
      toolbar.$cache.get(topicMenu).prop(selected, true);
    }

    toolbar.$cache.get(toolbar.selectorStart + "activity-" + activity).prop(selected, true);
  },

  /**
   * The user will be signed in/out according to the value of the
   * stored email address.
   *
   * @param {string} userEmail the email address of the user
   */
  verifySignInStatus: function(userEmail) {
    if (userEmail == "") {
      toolbar.signOut();
    }
    else {
      toolbar.signIn(userEmail);
    }
  },

  /**
   * Restore enabled/disabled auto-enhance selection.
   *
   * @param {boolean} enabled true if auto-enhance is still enabled, false otherwise
   */
  restoreAutoEnhance: function(enabled) {
    if (enabled) {
      toolbar.turnOnAutoEnhance();

      toolbar.$cache.get(toolbar.selectorStart + "enhance-button").click();
    }
    else {
      toolbar.turnOffAutoEnhance();
    }
  },

  /**
   * Hide the sign in link and show the signed in status, user email and sign
   * out link. Fill in the user email.
   *
   * @param {string} userEmail the user id given from the provider
   */
  signIn: function(userEmail) {
    const identityIdStart = toolbar.selectorStart + "identity-";
    const $UserEmailID = toolbar.$cache.get(identityIdStart + "signedinuseremail");

    toolbar.$cache.get(identityIdStart + "signinlink").hide();

    toolbar.$cache.get(identityIdStart + "signedinstatus").show();
    $UserEmailID.show();
    toolbar.$cache.get(identityIdStart + "signoutlink").show();

    $UserEmailID.text(userEmail);
  },

  /**
   * Show the sign in link and hide the signed in status, user email and sign
   * out link.
   */
  signOut: function() {
    const identityIdStart = toolbar.selectorStart + "identity-";

    toolbar.$cache.get(identityIdStart + "signinlink").show();

    toolbar.$cache.get(identityIdStart + "signedinstatus").hide();
    toolbar.$cache.get(identityIdStart + "signedinuseremail").hide();
    toolbar.$cache.get(identityIdStart + "signoutlink").hide();
  }
};

/**
 * Only start to request the topics and initialize the toolbar when the
 * document is ready.
 */
toolbar.$cache.get(document).ready(function() {
  toolbar.requestTopicsAndInit();
});

/**
 * Processes all messages received from background.js.
 * Sends requests to backround.js or handles requests here.
 *
 * @param {*} request the message sent by the calling script
 */
function processMessageForToolbar(request) {
  switch (request.msg) {
    case "show element":
      toolbar.$cache.get(request.selector).show();
      break;
    case "hide element":
      toolbar.$cache.get(request.selector).hide();
      break;
    case "call signIn":
      toolbar.signIn(request.userEmail);
      break;
    case "call signOut":
      toolbar.signOut();
      break;
    default:// TODO: remove eventually
      console.log("There was an unhandled Message!\n" +
        "The message was:" + request.msg);
  }
}

chrome.runtime.onMessage.addListener(processMessageForToolbar);	