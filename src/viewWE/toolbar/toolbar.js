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

  activitySelectors: {},

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

    toolbar.initViewMenuBtn();

    toolbar.initStatisticsMenuBtn();

    toolbar.initOnWindowClick();

    toolbar.initAutoEnhance();

    toolbar.initLanguageMenu();

    toolbar.initTopicMenu();

    toolbar.initFilterAndActivityMenu();

    toolbar.initActivitySelectors();

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
  initViewMenuBtn: function() {
    toolbar.$cache.get("#wertiview-VIEW-menu-btn").on("click",
      toolbar.requestToToggleViewMenu);
  },

  /**
   * Send a request to the background script to pass on the message to
   * toggle the VIEW menu.
   */
  requestToToggleViewMenu: function() {
    chrome.runtime.sendMessage({msg: "toggle VIEW Menu"}, toolbar.noResponse);
  },

  /**
   * A function that is supposed to be a placeholder for a response callback.
   */
  noResponse: function() {
    // This is intentional
  },

  /**
   * Init the handler for the statistics button.
   * Call requestToToggleStatisticsMenu() on click.
   */
  initStatisticsMenuBtn: function() {
    toolbar.$cache.get(toolbar.selectorStart + "statistics-menu-button").on("click",
      toolbar.requestToToggleStatisticsMenu);
  },

  /**
   * Send a request to the background script to pass on the message to
   * toggle the statistics menu.
   */
  requestToToggleStatisticsMenu: function() {
    chrome.runtime.sendMessage({msg: "toggle statistics menu"}, toolbar.noResponse);
  },

  /**
   * Hide the view and statistics menu when anything but the menu buttons were clicked.
   * Remove the instant feedback dialog.
   */
  initOnWindowClick: function() {
    toolbar.$cache.get(window).on("click", function(event) {
      const $Target = $(event.target);
      if (!$Target.closest("#wertiview-VIEW-menu-btn").length) {
        toolbar.requestToHideViewMenu();
      }
      if (!$Target.closest(toolbar.selectorStart + "statistics-menu-button").length) {
        toolbar.requestToHideStatisticsMenu();
      }

      toolbar.requestToRemovePerformanceDialog();
    });
  },

  /**
   * Send a request to the background script to pass on the message to
   * hide the VIEW menu.
   */
  requestToHideViewMenu: function() {
    chrome.runtime.sendMessage({msg: "hide VIEW Menu"}, toolbar.noResponse);
  },

  /**
   * Send a request to the background script to pass on the message to
   * hide the statistics menu.
   */
  requestToHideStatisticsMenu: function() {
    chrome.runtime.sendMessage({msg: "hide statistics menu"}, toolbar.noResponse);
  },

  /**
   * Send a request to the background script to pass on the message to
   * remove the performance dialog.
   */
  requestToRemovePerformanceDialog: function() {
    chrome.runtime.sendMessage({msg: "remove performance dialog"}, toolbar.noResponse);
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
   * @param {string} selectedLanguage the language selected by the user
   */
  selectTopicMenu: function(selectedLanguage) {
    const $topicMenu = toolbar.$cache.get(toolbar.selectorStart + "topic-menu-" + selectedLanguage);
    const selectedTopicMenu = "selected-toolbar-topic-menu";

    $(".wertiview-topic-menu").removeClass(selectedTopicMenu).hide();

    $topicMenu.addClass(selectedTopicMenu).show();

    const topic = $topicMenu.val();

    toolbar.checkForFilters(selectedLanguage, topic);
    toolbar.updateActivities(selectedLanguage, topic);
  },

  /**
   * Check if filters are available for the topic and language selection.
   *
   * @param language the current language
   * @param topic the current topic
   */
  checkForFilters: function(language, topic) {
    const $FilterMenu = toolbar.$cache.get(toolbar.selectorStart + "filter-menu");

    $FilterMenu.hide();
    $FilterMenu.val("no-filter");
    toolbar.$cache.get(toolbar.selectorStart + "filter-unselected").next().nextAll().remove();

    if(toolbar.topics[topic] &&
      toolbar.topics[topic][language]){
      const filters = toolbar.topics[topic][language].filters;

      if(filters){
        toolbar.showFilterMenu(filters);
      }
    }
  },

  /**
   * Show the filter menu with the filters defined for the topic.
   *
   * @param {Object} filters the available filters for the topic
   */
  showFilterMenu: function(filters) {
    const $FilterMenu = toolbar.$cache.get(toolbar.selectorStart + "filter-menu");

    $FilterMenu.val("unselected");

    toolbar.addFilterOptions(filters, $FilterMenu);

    $FilterMenu.show();
  },

  /**
   * Add filter options to the filter menu.
   *
   * @param {Object} filters the available filters for the topic
   * @param {Object} $FilterMenu the filter menu the options are added to
   */
  addFilterOptions: function(filters, $FilterMenu) {
    $.each(filters, function(filter) {
      const filterObject = filters[filter];
      const $Option = $("<option>");

      $Option.attr("id", filterObject.id);
      $Option.val(filterObject.val);
      $Option.text(filterObject.text);

      $FilterMenu.append($Option);
    });
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
    const unselected = "unselected";
    const $ActivityMenu = toolbar.$cache.get(toolbar.selectorStart + "activity-menu");

    $ActivityMenu.children().remove();

    $ActivityMenu.append(toolbar.activitySelectors[unselected]);

    if (
      language !== unselected &&
      !topic.startsWith(unselected) &&
      toolbar.topics[topic] &&
      toolbar.topics[topic][language]) {
      toolbar.enableAndShowActivities(language, topic);
    }

    toolbar.toggleEnhanceButton();
  },

  /**
   * Toggle the enhance button depending on activity selection
   * and eventually filter selection.
   */
  toggleEnhanceButton: function() {
    const $EnhanceButton = toolbar.$cache.get(toolbar.selectorStart + "enhance-button");

    if(toolbar.$cache.get(toolbar.selectorStart + "filter-menu").val() === "unselected" ||
      toolbar.$cache.get(toolbar.selectorStart + "activity-menu").val() === "unselected"){
      $EnhanceButton.hide();
    }
    else{
      $EnhanceButton.show();
    }
  },

  /**
   * Enable and show only activities that are available for the language and
   * topic combination. Show the horizontal separator.
   *
   * @param {string} language the selected language
   * @param {string} topic the selected topic
   */
  enableAndShowActivities: function(language, topic) {
    const $ActivityMenu = toolbar.$cache.get(toolbar.selectorStart + "activity-menu");
    const activitySelectors = toolbar.activitySelectors;
    const availableActivities = toolbar.topics[topic][language].activities;

    $ActivityMenu.append(activitySelectors["splitter"]);

    $.each(availableActivities, function(activity) {
      $ActivityMenu.append(activitySelectors[activity]);
    });

    $ActivityMenu.val("unselected");
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

      toolbar.checkForFilters(language, topic);

      toolbar.updateActivities(language, topic);
    });
  },

  /**
   * Initialize the filter and activity menu handler.
   */
  initFilterAndActivityMenu: function() {
    toolbar.$cache.get(
      toolbar.selectorStart + "filter-menu, " +
      toolbar.selectorStart + "activity-menu").on("change",
      toolbar.toggleEnhanceButton
    );
  },

  /**
   * Init all activity selectors in order to retrieve
   * the proper activity options for a topic.
   */
  initActivitySelectors: function() {
    toolbar.$cache.get(toolbar.selectorStart + "activity-menu").find("option").each(function() {
      const $ActivityOption = $(this);

      toolbar.activitySelectors[$ActivityOption.val()] = $ActivityOption;
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
   * Set language, topic, activity and timestamp if none of the activities
   * are "unselected".
   * Afterwards prepare to enhance the page.
   */
  setSelectionsAndPrepareToEnhance: function() {
    const timestamp = Date.now();
    const language = toolbar.$cache.get(toolbar.selectorStart + "language-menu").val();
    const topic = $(".selected-toolbar-topic-menu").val();
    const filter = toolbar.$cache.get(toolbar.selectorStart + "filter-menu").val();
    const activity = toolbar.$cache.get(toolbar.selectorStart + "activity-menu").val();

    chrome.storage.local.set({
      language: language,
      topic: topic,
      filter: filter,
      activity: activity,
      timestamp: timestamp
    }, toolbar.prepareToEnhance);
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
    chrome.storage.local.get("serverURL", function(result) {
      const authenticator = result.serverURL + "/authenticator.html";
      toolbar.$cache.get(toolbar.selectorStart + "identity-signinlink").attr("link", authenticator);
      toolbar.$cache.get(toolbar.selectorStart + "identity-signoutlink").attr("link", authenticator);
    });
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
      "filter",
      "activity",
      "userEmail",
      "enabled"
    ], function(res) {
      const language = res.language || "unselected";
      const topic = res.topic || "unselected";
      const filter = res.filter || "no-filter";
      const activity = res.activity || "unselected";
      const userEmail = res.userEmail || "";
      const enabled = res.enabled || false;

      toolbar.restoreSelectionMenus(language, topic, filter, activity);

      toolbar.toggleEnhanceButton();

      toolbar.verifySignInStatus(userEmail);

      toolbar.restoreAutoEnhance(enabled);
    });
  },

  /**
   * Restore all selections of the selection menus.
   *
   * @param {string} language the stored language
   * @param {string} topic the stored topic
   * @param {string} filter the stored filter
   * @param {string} activity the stored activity
   */
  restoreSelectionMenus: function(language, topic, filter, activity) {
    const selected = "selected";

    toolbar.$cache.get(toolbar.selectorStart + "language-" + language).prop(selected, true);

    const topicMenu = toolbar.selectorStart + "topic-" + topic;

    // special case Dets and Preps are shared between en, de and es
    if (topic === "determiners" || topic === "Preps") {
      toolbar.$cache.get(topicMenu + "-" + language).prop(selected, true);
    }
    else {
      toolbar.$cache.get(topicMenu).prop(selected, true);
    }

    toolbar.selectTopicMenu(language);

    toolbar.$cache.get(toolbar.selectorStart + "filter-" + filter).prop(selected, true);

    toolbar.$cache.get(toolbar.selectorStart + "activity-" + activity).prop(selected, true);
  },

  /**
   * The user will be signed in/out according to the value of the
   * stored email address.
   *
   * @param {string} userEmail the email address of the user
   */
  verifySignInStatus: function(userEmail) {
    if (!userEmail) {
      toolbar.signOut()
    }
    else {
      toolbar.signIn(userEmail);
    }
  },

  /**
   * Restore enabled/disabled auto-enhance selection.
   * If auto-enhance is enabled, set selections and prepare to enhance.
   *
   * @param {boolean} enabled true if auto-enhance is still enabled, false otherwise
   */
  restoreAutoEnhance: function(enabled) {
    if (enabled) {
      toolbar.turnOnAutoEnhance();

      toolbar.setSelectionsAndPrepareToEnhance();
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

    toolbar.$cache.get(
      toolbar.selectorStart + "statistics-menu-button").show();
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

    toolbar.$cache.get(
      toolbar.selectorStart + "statistics-menu-button").hide();
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
  }
}

chrome.runtime.onMessage.addListener(processMessageForToolbar);	
