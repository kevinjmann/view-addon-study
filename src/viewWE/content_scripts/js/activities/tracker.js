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
      const trackingData = {};

      trackingData["token"] = view.token;
      trackingData["task-id"] = view.taskId;
      trackingData["enhancement-id"] = $EnhancementElement.attr("id");
      trackingData["submission"] = submission;
      trackingData["sentence"] = "fake-sentence";
      trackingData["is-correct"] = isCorrect;

      const capType = view.lib.detectCapitalization($EnhancementElement.text());
      trackingData["correct-answer"] = view.activityHelper.getCorrectAnswer($EnhancementElement, capType);
      trackingData["used-solution"] = usedSolution;

      trackingData["timestamp"] = view.timestamp;

      view.tracker.requestToSendTrackingData(trackingData);
    }
  },

  /**
   * Send a request to the background script to send tracking data
   * to the server.
   *
   * @param {object} trackingData the data to be sent
   */
  requestToSendTrackingData: function(trackingData) {
    chrome.runtime.sendMessage({
      msg: "send trackingData",
      trackingData: trackingData,
      serverTrackingURL: view.serverTrackingURL
    });
  }
};
