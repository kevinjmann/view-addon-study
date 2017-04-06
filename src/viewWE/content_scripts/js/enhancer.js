view.enhancer = {
  isAborted: false,

  /**
   * Start the enhancement process by creating the request data.
   * Send the request data to background.js for further processing
   * on the server side.
   */
  enhance: function() {
    if ($("viewenhancement").length > 0) {
      view.enhancer.restoreToOriginal();
    }

    if ("cloze" === view.activity) {
      view.blur.add();
    }

    if (view.showInst) {
      view.enhancer.constructInstruction();
    }

    view.enhancer.requestToToggleElement(
      "show element",
      "#wertiview-toolbar-abort-button"
    );

    view.enhancer.createActivityData();
  },

  /**
   * Start to remove the wertiview markup and
   * restore the original page.
   */
  restoreToOriginal: function() {
    view.activityHelper.restore();

    $("viewenhancement").each(function() {
      $(this).replaceWith($(this).data("original-text"));
    });

    view.lib.enableAnchors();

    view.enhancer.requestToToggleElement(
      "hide element",
      "#wertiview-toolbar-restore-button"
    );

    view.notification.remove();
    view.blur.remove();

    $("#wertiview-inst-notification").remove();
  },

  /**
   * Constructs the instruction when the page is being enhanced for the given
   * topic and activity when the preference "show instructions" is enabled.
   */
  constructInstruction: function() {
    console.log("constructInstruction()");

    const topic = view.topic;

    const activities = view.topics[topic][view.language].activities;

    const instruction = activities[view.activity].description.text;

    if (instruction !== "") {
      // construct the instruction for the given topic and activity, can also be avoided by the user
      view.notification.addInst(instruction, true);
    }
    else {
      console.log("constructInstruction: the instruction is missing for the topic '" + topic + "'!");
    }
  },

  /**
   * Send a request to toolbar.js to toggle (show/hide) the element with the
   * given selector.
   *
   * @param {String} msg the request message "show/hide element"
   * @param {String} selector the selector of the element to toggle
   */
  requestToToggleElement: function(msg, selector) {
    chrome.runtime.sendMessage({
      msg: msg,
      selector: selector
    }, view.lib.noResponse);
  },

  /**
   * Creates the activity data to be send to background.js
   * for further processing on the server side.
   */
  createActivityData: function() {
    console.log("createActivityData(contextDoc)");

    const activityData = {};
    activityData["url"] = view.url;
    activityData["language"] = view.language;
    activityData["topic"] = view.topic;
    activityData["filter"] = view.filter;
    activityData["activity"] = view.activity;
    activityData["document"] = $("#wertiview-content").html();

    // send a request to the background script, to send the activity data to the server for processing
    console.log("createActivityData: request 'send activityData'");
    chrome.runtime.sendMessage({
      msg: "send activityData",
      activityData: activityData,
      ajaxTimeout: view.ajaxTimeout,
      servletURL: view.servletURL
    }, view.lib.noResponse);
  },

  /*
   * The extension send the message to call initialInteractionState().
   */
  callInitialInteractionState: function(request) {
    console.log("callinitialInteractionState: received '" + request.msg + "'");
    view.enhancer.initialInteractionState();
  },

  /*
   * Returns to initial interaction state, where the loading image and abort
   * button are hidden and the enhance button is enabled. Blur overlay is removed.
   */
  initialInteractionState: function() {
    view.enhancer.requestToToggleElement(
      "hide element",
      "#wertiview-toolbar-loading-image"
    );
    view.enhancer.requestToToggleElement(
      "hide element",
      "#wertiview-toolbar-abort-button"
    );
    view.enhancer.requestToToggleElement(
      "show element",
      "#wertiview-toolbar-enhance-button"
    );
    view.blur.remove();
  },

  /*
   * The extension send the message to call addServerMarkup(data, options).
   */
  callAddServerMarkup: function(request) {
    console.log("callAddServerMarkup: received '" + request.msg + "'");
    // once the server has finished processing the
    // enhancement, the user can no longer stop it
    if (!view.enhancer.isAborted) {
      view.enhancer.requestToToggleElement(
        "hide element",
        "#wertiview-toolbar-abort-button"
      );
      view.enhancer.addServerMarkup(request.data);
    }
  },

  /*
   * Adds the html markup sent from the server to the page.
   */
  addServerMarkup: function(data) {
    console.log("addServerMarkup(data)");

    $("#wertiview-content").html(data);

    view.selector.select(view.filter);
    view.enhancer.runActivity();
    view.enhancer.initialInteractionState();
    view.enhancer.requestToToggleElement(
      "show element",
      "#wertiview-toolbar-restore-button"
    );
  },

  /*
   * Runs the activity selected and informs user when finished with processing
   */
  runActivity: function() {
    console.log("runActivity()");

    switch (view.activity) {
      case "color":

        view.color.run(view.topic);

        view.notification.add("VIEW Colorize Activity Ready");
        break;
      case "click":
        view.lib.disableAnchors();

        view.click.run();

        view.notification.add("VIEW Click Activity Ready");

        break;
      case "mc":
        view.lib.disableAnchors();

        view.mc.run();

        view.notification.add("VIEW Multiple Choice Activity Ready");
        break;
      case "cloze":
        view.lib.disableAnchors();

        view.cloze.run();

        view.notification.add("VIEW Practice Activity Ready");
        view.blur.remove();
        break;
      default:
        view.blur.remove();
        alert("Invalid activity");
    }
  },

  /*
   * The extension send the message to call abort().
   */
  callAbort: function(request) {
    console.log("callAbort: received '" + request.msg + "'");
    view.enhancer.abort();
  },

  /*
   * Abort the enhancement process.
   */
  abort: function() {
    console.log("abort()");

    const requestData = {};
    requestData["url"] = view.url;
    requestData["language"] = view.language;
    requestData["topic"] = view.topic;
    requestData["filter"] = view.filter;
    requestData["activity"] = view.activity;

    // send a request to the background script, to send the request data to the server for processing
    console.log("abort: request 'send requestData abort'");
    chrome.runtime.sendMessage({
      msg: "send requestData abort",
      requestData: requestData,
      ajaxTimeout: view.ajaxTimeout,
      servletURL: view.servletURL
    });
  },

  /*
   * The extension send the message to abort the enhancement.
   */
  abortEnhancement: function(request) {
    console.log("abortEnhancement: received '" + request.msg + "'");
    //always revert to the Enhance button, no matter whether the
    // server process was stopped successfully
    view.enhancer.initialInteractionState();
    view.enhancer.isAborted = true;
  },

  /*
   * The extension send the message to call restoreToOriginal().
   */
  callRestoreToOriginal: function(request) {
    console.log("callAbort: received '" + request.msg + "'");
    view.enhancer.restoreToOriginal();
  },

  /*
   * The extension send the message to sign out the user.
   */
  signOutUser: function(request) {
    console.log("signOutUser: received '" + request.msg + "'");
    view.userid = "";
  },

  /*
   * The extension send the message to sign in the user.
   */
  signInUser: function(request) {
    console.log("signInUser: received '" + request.msg + "'");
    view.userid = request.userid;
  }
};