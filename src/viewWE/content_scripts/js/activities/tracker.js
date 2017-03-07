view.tracker = {
  /**
   * Tracks data from the user-interaction with the activity and sends
   * the data to the server.
   *
   * @param {object} $EnhancementElement the current enhancement element the
   * user is interacting with
   * @param {string} submission the submission obtained from the user action
   * @param {boolean} isCorrect true if the answer is correct,
   * false otherwise
   * @param usedHint true if a hint was used, false otherwise
   */
  trackData: function($EnhancementElement, submission, isCorrect, usedHint) {
    const interactionData = {};

    interactionData["token"] = view.token;
    interactionData["task-id"] = view.taskId;
    interactionData["enhancement-id"] = $EnhancementElement.attr("id");
    interactionData["submission"] = submission;
    interactionData["is-correct"] = isCorrect;

    const isClick = (view.activity === "click");

    if (!isClick) {
      const capType = view.lib.detectCapitalization($EnhancementElement.text());
      interactionData["correct-answer"] = view.activityHelper.getCorrectAnswer($EnhancementElement, capType);
      interactionData["used-hint"] = usedHint;
    }

    interactionData["timestamp"] = view.timestamp;

    view.tracker.requestToSendInteractionData(interactionData);
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
      serverTrackingURL: view.serverTrackingURL
    });
  }
};
