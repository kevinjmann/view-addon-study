view.interaction = {
  toolbarUI: undefined,

  /*
   * Create the toolbar ui iframe and inject it in the current page
   */
  initToolbar: function() {
    var $iframe = $("<iframe>");
    $iframe.attr("id", "view-toolbar-iframe");
    $iframe.attr("src", chrome.runtime.getURL("toolbar/toolbar.html"));

    var $body = $("body");

    var $bodyContainer = $("<div id='wertiview-body-container'>");

    var $bodyContent = $("<div id='wertiview-body-content'>");

    $body.children().wrapAll($bodyContent);

    $bodyContent = $("#wertiview-body-content");

    $bodyContainer.append($bodyContent);

    $bodyContainer.addClass("down");

    $body.append($bodyContainer);

    view.VIEWmenu.add();

    view.statisticsMenu.add();

    view.lib.initHideMenuHandler();

    $body.prepend($iframe);

    return view.interaction.toolbarUI = $iframe;
  },

  /*
   * Toggle the toolbar directly if it already exists,
   * initialize it otherwise.
   * Hide the view menu in case it is still open.
   */
  toggleToolbar: function(request) {
    console.log("toggle toolbar: received '" + request.msg + "'");
    var toolbarUI = view.interaction.toolbarUI;
    if (toolbarUI) {
      toolbarUI.toggle();

      var $bodyContainer = $("#wertiview-body-container");

      if (toolbarUI.is(":visible")) {
        $bodyContainer.addClass("down");
      }
      else {
        view.VIEWmenu.hide();
        $bodyContainer.removeClass("down");
      }
    } else {
      view.setGeneralOptions();
      view.interaction.initToolbar();
    }
  },

  isAborted: false,

  /*
   * Start the enhancement process by creating the request data.
   * Send the request data to background.js for further processing
   * on the server side.
   */
  enhance: function() {
    console.log("enhance()");

    // remove any previous wertiview markup an restore the page to the original
    if ($("viewenhancement").length > 0 ||
      $("viewtoken").length > 0) {
      view.interaction.restoreToOriginal();
    }

    // blur the page for cloze activity
    if (view.activity == "cloze") {
      view.blur.add();
    }

    // identify context document under consideration
    var contextDoc = document;

    if (view.showInst) {
      // Construct the instruction for the given topic and activity
      view.interaction.constructInstruction();
    }

    // save the options used in the page
    $("body").data("wertiview-language", view.language);
    $("body").data("wertiview-topic", view.topic);
    $("body").data("wertiview-activity", view.activity);

    console.log("enhance: body(data): " + JSON.stringify($("body").data()));

    // only enable the abort button once we have stored the enhId
    chrome.runtime.sendMessage({
      msg: "show element",
      selector: "#wertiview-toolbar-abort-button"
    }, view.lib.noResponse);

    // create the activity data from the copy with the spans in it
    view.interaction.createActivityData(contextDoc);
  },

  /*
   * Get the topic name from the topic.
   */
  getTopicName: function(topic) {
    // figure out corresponding topic name
    var topicName = topic.toLowerCase();

    // exceptions:
    //  - e.g. Arts and Dets and Preps use the 'pos' topic
    switch (topic) {
      case "articles":
      case "determiners":
      case "Preps":
        topicName = "pos";
        break;
      case "nouns-singular":
      case "nouns-plural":
        topicName = "nouns";
        break;
      case "RusAdjectiveFeminine":
      case "RusAdjectiveMasculine":
      case "RusAdjectiveNeutral":
        topicName = "rusadjectives";
        break;
      case "RusVerbPastTense":
      case "RusVerbPresentTense":
      case "RusVerbPerfective":
      case "RusVerbImperfective":
        topicName = "rusverbs";
        break;
      default:
        break;
    }
    return topicName;
  },

  /*
   * The extension send the message to call initialInteractionState().
   */
  callInitialInteractionState: function(request) {
    console.log("callinitialInteractionState: received '" + request.msg + "'");
    view.interaction.initialInteractionState();
  },

  /*
   * Returns to initial interaction state, where the loading image and abort
   * button are hidden and the enhance button is enabled. Blur overlay is removed.
   */
  initialInteractionState: function() {
    chrome.runtime.sendMessage({
      msg: "hide element",
      selector: "#wertiview-toolbar-loading-image"
    });
    chrome.runtime.sendMessage({
      msg: "hide element",
      selector: "#wertiview-toolbar-abort-button"
    });
    chrome.runtime.sendMessage({
      msg: "show element",
      selector: "#wertiview-toolbar-enhance-button"
    });
    view.blur.remove();
  },

  /*
   * Constructs the instruction when the page is being enhanced for the given
   * topic and activity when the preference "show instructions" is enabled.
   */
  constructInstruction: function(topicName, activityTyp) {
    console.log("constructInstruction()");

    var topics = view.topics;

    var language = view.language;

    var topic = view.topic;

    var activity = view.activity;

    var activities = topics[topic][language].activities;

    var instruction = activities[activity].description.text;

    if (instruction !== "") {
      // construct the instruction for the given topic and activity, can also be avoided by the user
      view.notification.addInst(instruction, true);
    }
    else {
      console.log("constructInstruction: the instruction is missing for the topic '" + topic + "'!");
    }
  },

  /*
   * Creates the activity data to be send to background.js
   * for further processing on the server side.
   */
  createActivityData: function(contextDoc) {
    console.log("createActivityData(contextDoc)");

    var activityData = {};
    activityData["url"] = view.url;
    activityData["language"] = view.language;
    activityData["topic"] = view.topic;
    activityData["filter"] = view.filter;
    activityData["activity"] = view.activity;
    activityData["document"] = $("#wertiview-body-content").html();

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
   * The extension send the message to call addServerMarkup(data, options).
   */
  callAddServerMarkup: function(request) {
    console.log("callAddServerMarkup: received '" + request.msg + "'");
    // once the server has finished processing the
    // enhancement, the user can no longer stop it
    if (!view.interaction.isAborted) {
      chrome.runtime.sendMessage({
        msg: "hide element",
        selector: "#wertiview-toolbar-abort-button"
      });
      view.interaction.addServerMarkup(request.data);
    }
  },

  /*
   * Adds the html markup sent from the server to the page.
   */
  addServerMarkup: function(data) {
    console.log("addServerMarkup(data)");

    $("#wertiview-body-content").html(data);

    view.selector.select(view.filter);
    view.interaction.runActivity();
    view.interaction.initialInteractionState();
    chrome.runtime.sendMessage({
      msg: "show element",
      selector: "#wertiview-toolbar-restore-button"
    });
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
    view.interaction.abort();
  },

  /*
   * Abort the enhancement process.
   */
  abort: function() {
    console.log("abort()");

    // find out the enhancement ID of this page
    var enhId = $("body").data("wertiview-enhId");

    var requestData = {};
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
    view.interaction.initialInteractionState();
    view.interaction.isAborted = true;
  },

  /*
   * The extension send the message to call restoreToOriginal().
   */
  callRestoreToOriginal: function(request) {
    console.log("callAbort: received '" + request.msg + "'");
    view.interaction.restoreToOriginal();
  },

  /*
   * Start to remove the wertiview markup and
   * restore the original page.
   * TODO: BUG: in the cloze activity not everything
   * gets restored: for instance when the wrong answer is left alone and
   * enhance is pressed, the token count increases, same with correct answers.
   */
  restoreToOriginal: function() {
    console.log("restoreToOriginal()");

    var topicName = view.interaction.getTopicName($("body").data("wertiview-topic"));

    $("body").removeData("wertiview-language");
    $("body").removeData("wertiview-topic");
    $("body").removeData("wertiview-activity");

    // if we can't find a topic name, skip the rest of the removal
    if (topicName == null) {
      return;
    }

    // remove activity specific markup
    view.activityHelper.restore();

    $("viewenhancement").each(function() {
      $(this).replaceWith($(this).data("original-text"));
    });

    view.lib.enableAnchors();

    chrome.runtime.sendMessage({
      msg: "hide element",
      selector: "#wertiview-toolbar-restore-button"
    }, view.lib.noResponse);

    view.notification.remove();
    view.blur.remove();

    $("#wertiview-inst-notification").remove();
  }
};