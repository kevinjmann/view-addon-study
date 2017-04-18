view.tracker = {
  /**
   * Tracks data from the user-interaction with the activity and sends
   * the data to the server. The user has to be logged in.
   *
   * @param {object} $EnhancementElement the current enhancement element the
   * user is interacting with
   * @param {string} submission the submission obtained from the user action
   * @param {boolean} isCorrect true if the answer is correct,
   * false otherwise
   * @param usedSolution true if a hint was used, false otherwise
   */
  trackData: function($EnhancementElement, submission, isCorrect, usedSolution) {
    if (view.userid) {
      const interactionData = {};

      interactionData["token"] = view.token;
      interactionData["task-id"] = view.taskId;
      interactionData["enhancement-id"] = $EnhancementElement.attr("id");
      interactionData["submission"] = submission;
      interactionData["sentence"] = "fake-sentence";
      interactionData["is-correct"] = isCorrect;

      const capType = view.lib.detectCapitalization($EnhancementElement.text());
      interactionData["correct-answer"] = view.activityHelper.getCorrectAnswer($EnhancementElement, capType);
      interactionData["used-solution"] = usedSolution;

      interactionData["timestamp"] = view.timestamp;

      view.tracker.requestToSendInteractionData(interactionData);
    }
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
