view.collector = {
  /**
   * Collects data from the user-interaction with the activity and sends
   * it to the server for tracking.
   *
   * @param {object} $EnhancementElement the current enhancement element the
   * user is interacting with
   * @param {string} input the input obtained from the user action
   * @param {boolean} countsAsCorrect true if the answer is correct,
   * false otherwise
   * @param usedHint true if a hint was used, false otherwise
   */
  collectAndSendData: function($EnhancementElement, input, countsAsCorrect, usedHint) {
    const interactionData = {};

    interactionData["user"] = view.user;
    interactionData["token"] = view.token;
    interactionData["session-id"] = view.sessionid;
    interactionData["enhancement-id"] = $EnhancementElement.attr("id");
    interactionData["submission"] = input;
    interactionData["correct"] = countsAsCorrect;
    interactionData["timestamp"] = view.timestamp;

    const isClick = (view.activity === "click");

    if (!isClick) {
      const capType = view.lib.detectCapitalization($EnhancementElement.text());
      interactionData["correct-answer"] = view.activityHelper.getCorrectAnswer($EnhancementElement, capType);
      interactionData["used-hint"] = usedHint;
    }

    view.collector.requestToSendInteractionData(interactionData);
  },

  /**
   * Send a request to the background script to send interaction data
   * to the server.
   *
   * @param {object} interactionData the data to be sent
   */
  requestToSendInteractionData: function(interactionData) {
    chrome.runtime.sendMessage({
      msg: "send interactionData",
      interactionData: interactionData,
      servletURL: view.servletURL
    });
  }
};