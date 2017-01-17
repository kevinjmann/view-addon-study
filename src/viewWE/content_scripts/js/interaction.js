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
      view.saveGeneralOptions();
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
      case "RusNounSingular":
      case "RusNounPlural":
        topicName = "rusnouns";
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
    activityData["url"] = contextDoc.baseURI;
    activityData["language"] = view.language;
    activityData["topic"] = view.topic;
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

    var topic = view.topicName;

    switch (view.activity) {
      case "color":

        view.color.run(view.topic);

        view.notification.add("VIEW Colorize Activity Ready");
        break;
      case "click":
        $("body").on("click", "a", view.lib.clickDisableLink);

        view.click.run();

        view.notification.add("VIEW Click Activity Ready");

        break;
      case "mc":
        // no link disabling because the drop-down boxes are prevented
        // from showing up with links because they act strange in links

        view.mc.run();

        view.notification.add("VIEW Multiple Choice Activity Ready");
        break;
      case "cloze":
        // remove click from all links that contain input boxes
        $("body").on("click", "a", view.lib.clozeDisableLink);

        view[topic].cloze();

        view.notification.add("VIEW Practice Activity Ready");
        view.blur.remove();
        break;
      default:
        view.blur.remove();
        // we should never get here
        alert("Invalid activity");
    }
  },

  /*
   * Returns the input using the parameters.
   * Used in the collectInfoData function.
   */
  collectInputData: function(element, usedHint, isClick) {
    var result = undefined;
    if (usedHint) {
      element = element.prev();
    }
    if (!isClick && element.val() !== "") {
      result = element.val();
    } else if (!isClick && element.val() == "") {
      result = "no input";
    } else {
      result = element.text();
    }
    return result;
  },

  /*
   * Returns the correct answer using the paramters.
   * Used in the collectInfoData function.
   */
  collectAnswerData: function(element, usedHint) {
    if (usedHint) {
      element = element.prev();
    }
    return element.data("viewanswer");
  },

  /*
   * Collects information available before the user interaction updates the page.
   *
   * @param element which the user is currently working at
   * @param usedHint whether the user clicked the 'hint' button (default: false)
   * @param collectInputDataCallback function that returns the user input (default: collectInputData)
   * @param collectAnswerDataCallback function that returns the correct answer (default: collectAnswerData)
   */
  collectInfoData: function(element, usedHint, collectInputDataCallback, collectAnswerDataCallback) {
    var info = {};
    var elementInfo = {};

    // collect info data before interaction
    info["url"] = document.baseURI;
    info["language"] = view.language;
    info["topic"] = view.topic;
    info["activity"] = view.activity;
    var isClick = (info["activity"] == "click");
    // get the outermost <span class="wertiview"> around this tag
    var wertiviewSpan = undefined;
    $(element).parents("span.wertiview").each(function() {
      // sometimes an object on this list is {}
      if (this !== undefined && this !== null && this != {}) {
        wertiviewSpan = $(this);
      }
    });
    if (wertiviewSpan !== undefined) {
      elementInfo["wertiviewspanid"] = wertiviewSpan.data("wertiviewid");
    }
    elementInfo["wertiviewtokenid"] = $(element).attr("id");
    elementInfo["userinput"] = collectInputDataCallback($(element), usedHint, isClick);
    if (!isClick) {
      elementInfo["correctanswer"] = collectAnswerDataCallback($(element), usedHint);
      elementInfo["usedhint"] = usedHint;
    }

    var infos = {
      info: info,
      elementInfo: elementInfo
    };
    return infos;
  },

  /*
   * Collects and sends information about the interaction to the server.
   *
   * @param info contains all info available before user interaction updates the page
   * @param elementInfo contains all info of the element the user interacted with
   * @param countsAsCorrect marks the answer as correct or incorrect for the user
   * @param usedHint whether the user clicked the 'hint' button (default: false)
   */
  collectInteractionData: function(info, elementInfo, countsAsCorrect, usedHint) {
    // if the user used a hint, then it is definitely a correct answer
    elementInfo["countsascorrect"] = usedHint || countsAsCorrect;
    // yes, this is intended to be double-encoded in JSON
    info["document"] = JSON.stringify(elementInfo);

    // send a request to the background script,
    // send interaction data to the server for processing
    console.log("collectInteractionData: request 'send interactionData'");
    chrome.runtime.sendMessage({
      msg: "send interactionData",
      interactionData: info,
      servletURL: view.servletURL
    });
  },

  /*
   * Generate cloze exercises. TODO BUG: When typing an answer into the input field and then pressing on the
   * hint right away, both the typed answer and the hint event are triggered at the same time and send to the server.
   * @param hitList list of hits that could be turned into exercises, unwanted instance must be removed in advance
   * @param getCorrectAnswerCallback a function that returns the correct answer choice for a given hit
   * @param addProcCallback a function that is called for every exercise (default: wertiview.lib.doNothing)
   * @param emptyHit if true, the hit text will be erased (default: true)
   * @param partExercises decimal by which the number of exercises to generate is multiplied in 'fixed number' mode (default: 1.0)
   */
  clozeHandler: function(hitList, inputHandler, hintHandler,
                         getCorrectAnswerCallback, addProcCallback,
                         emptyHit, partExercises) {
    console.log("clozeHandler(hitList, inputHandler, hintHandler," +
      "getCorrectAnswerCallback, addProcCallback, " +
      "emptyHit, partExercises)");

    var fixedOrPercentageValue = view.fixedOrPercentage;
    var fixedNumberOfExercises = view.fixedNumberOfExercises;
    var percentageOfExercises = view.percentageOfExercises;
    var choiceModeValue = view.choiceMode;
    var firstOffset = view.firstOffset;
    var intervalSize = view.intervalSize;

    if (typeof addProcCallback == "undefined") {
      addProcCallback = view.lib.doNothing;
    }
    if (typeof emptyHit == "undefined") {
      emptyHit = true;
    }
    if (typeof partExercises == "undefined") {
      partExercises = 1.0;
    }

    // calculate the number of hits to turn into exercises
    var numExercises = 0;
    if (fixedOrPercentageValue == 0) {
      numExercises = fixedNumberOfExercises * partExercises;
    }
    else if (fixedOrPercentageValue == 1) {
      numExercises = percentageOfExercises * hitList.length;
    }
    else {
      // we should never get here
      view.lib.prefError();
    }

    // choose which hits to turn into exercises
    var i = 0;
    var inc = 1;
    if (choiceModeValue == 0) {
      view.lib.shuffleList(hitList);
    }
    else if (choiceModeValue == 1) {
      i = firstOffset;
    }
    else if (choiceModeValue == 2) {
      inc = intervalSize;
    }
    else {
      // we should never get here
      view.lib.prefError();
    }

    // override preferences for Konjunktiv
    if ($("body").data("wertiview-topic") == "Konjunktiv") {
      numExercises = hitList.length;
      i = 0;
      inc = 1;
    }

    // generate the exercises
    for (; numExercises > 0 && i < hitList.length; i += inc) {
      var $hit = hitList[i];
      const hitText = $hit.text().trim();

      var capType = view.lib.detectCapitalization(hitText);

      // correct choice
      var answer = getCorrectAnswerCallback($hit, capType);

      // create input box
      var $input = $("<input>");
      // save original text/answer
      $input.data("vieworiginaltext", hitText);
      $input.attr("type", "text");
      // average of 10 px per letter (can fit 10 x "м" with a width of 110)
      $input.css("width", (answer.length * 10) + "px");
      $input.addClass("clozeStyleInput");
      $input.addClass("viewinput");
      $input.data("viewanswer", answer);
      if (emptyHit) {
        $hit.empty();
      }
      $hit.append($input);

      // create hint ? button
      var $hint = $("<viewhint>");
      $hint.text("?");
      $hit.append($hint);

      // e.g., phrasalverbs needs to add colorization to the verb
      // and gerunds needs to display the base form
      addProcCallback($hit, capType);

      // count down numExercises until we"re finished
      numExercises--;
    }

    $("body").on("change", "input.viewinput", inputHandler);
    $("body").on("click", "viewhint", hintHandler);
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
    requestData["url"] = document.baseURI;
    requestData["language"] = view.language;
    requestData["topic"] = view.topic;
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

    // remove topic specific markup
    view[topicName].restore();

    $("viewenhancement").each(function() {
      $(this).replaceWith($(this).data("vieworiginaltext"));
    });

    $("body").off("click", "a", view.lib.clickDisableLink);
    $("body").off("click keydown", "a", view.lib.clozeDisableLink);

    chrome.runtime.sendMessage({
      msg: "hide element",
      selector: "#wertiview-toolbar-restore-button"
    }, view.lib.noResponse);

    view.notification.remove();
    view.blur.remove();

    $("#wertiview-inst-notification").remove();
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