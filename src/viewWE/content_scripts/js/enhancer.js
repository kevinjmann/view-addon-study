view.enhancer = {
  isAborted: false,

  /**
   * Start the enhancement process by creating the request data.
   * Send the request data to background.js for further processing
   * on the server side.
   */
  enhance: function() {
    view.enhancer.restoreToOriginal();

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

    const activityData = view.enhancer.createActivityData();

    view.enhancer.requestToSendActivityDataAndGetEnhancementMarkup(activityData);
  },

  /**
   * Start to remove the wertiview markup and
   * restore the original page if there is any markup.
   */
  restoreToOriginal: function() {
    if($("viewenhancement").length){
      $("#wertiview-content").html(view.originalContent);

      view.enhancer.requestToToggleElement(
        "hide element",
        "#wertiview-toolbar-restore-button"
      );

      view.notification.remove();
      view.blur.remove();

      $("#wertiview-inst-notification").remove();
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
   * Constructs the instruction when the page is being enhanced for the given
   * topic and activity when the preference "show instructions" is enabled.
   */
  constructInstruction: function() {
    const topic = view.topic;

    const activities = view.topics[topic][view.language].activities;

    const instruction = activities[view.activity].instruction;

    if(instruction){
      const instructionText = instruction.text;

      if (instructionText) {
        view.notification.addInst(instructionText, true);
      }
      else {
        view.notification.addInst("The instruction for the topic " +
          "<span class='colorize-style-" + topic + "'>" + topic + "</span>" +
          " is missing!", false);
      }
    }
  },

  /**
   * Creates the activity data to be send to the server.
   *
   * @returns {object} the activity data to be send
   */
  createActivityData: function() {
    return {
      url: view.url,
      language: view.language,
      topic: view.topic,
      filter: view.filter,
      activity: view.activity,
      document: $("#wertiview-content").html()
    };
  },

  /**
   * Send a request to the background script to pass on the activity data
   * to the server and get the enhancement markup.
   *
   * @param {object} activityData the data to pass on to the server
   */
  requestToSendActivityDataAndGetEnhancementMarkup: function(activityData) {
    chrome.runtime.sendMessage({
      msg: "send activityData and get enhancement markup",
      activityData: activityData,
      ajaxTimeout: view.ajaxTimeout,
      servletURL: view.servletURL
    }, view.lib.noResponse);
  },

  /**
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

  /**
   * Adds the enhancement markup sent from the server to the page.
   * Will only proceed if the user didn't abort the enhancement.
   *
   * @param {string} enhancementMarkup the markup from the server
   */
  addEnhancementMarkup: function(enhancementMarkup) {
    if (view.enhancer.isAborted) {
      view.enhancer.isAborted = false;
    }
    else{
      view.enhancer.requestToToggleElement(
        "hide element",
        "#wertiview-toolbar-abort-button"
      );

      $("#wertiview-content").html(enhancementMarkup);

      view.selector.select(view.filter);
      view.enhancer.runActivity();
      view.enhancer.initialInteractionState();
      view.enhancer.requestToToggleElement(
        "show element",
        "#wertiview-toolbar-restore-button"
      );
      view.enhancer.loadDebuggingOptions();
    }
  },

  loadDebuggingOptions: function() {
    if (view.debugSentenceMarkup) {
      console.log("Debugging sentence markup.");
      $("sentence, sentence a").css("color", "red");
      $("sentence[data-isbasedonblock]").css("background-color", "greenyellow");
      $("sentence sentence").css("border", "1px solid black");
    }
  },

  /**
   * Runs the activity selected and informs user when finished with processing.
   */
  runActivity: function() {
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
        view.notification.add(
          "The activity '" + view.activity + "' is not implemented!");
    }
  },

  /**
   * Abort the enhancement process.
   */
  abort: function() {
    view.enhancer.initialInteractionState();
    view.enhancer.isAborted = true;
  }
};
