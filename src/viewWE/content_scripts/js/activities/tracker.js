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
      const enhancementId = $EnhancementElement.attr("id");

      trackingData["token"] = view.token;
      trackingData["task-id"] = view.taskId;
      trackingData["enhancement-id"] = enhancementId;
      trackingData["submission"] = submission;
      trackingData["sentence"] = view.tracker.extractRawSentenceWithMarkedElement("#" + enhancementId);
      trackingData["is-correct"] = isCorrect;

      const capType = view.lib.detectCapitalization($EnhancementElement.text());
      trackingData["correct-answer"] = view.activityHelper.getCorrectAnswer($EnhancementElement, capType);
      trackingData["used-solution"] = usedSolution;

      trackingData["timestamp"] = view.timestamp;

      view.tracker.requestToSendTrackingData(trackingData);
    }
  },

  /**
   * Get the sentence of the enhancement element, mark the enhancement element
   * and strip all markup from the sentence.
   *
   * @param {string} enhancementSelector the selector of the element
   *
   * @return {string} the raw sentence with the marked element
   */
  extractRawSentenceWithMarkedElement: function(enhancementSelector) {
    const $Sentence = $("<sentence>");
    $Sentence.html(
      "Text <b>before</b> element " +
      $(enhancementSelector).prop("outerHTML") +
      " and <b>after</b> element."
    );

    const marker = "ñôŃßĘńŠē";

    $Sentence
    .find(enhancementSelector)
    .text(marker + $(enhancementSelector).text() + marker);

    return $Sentence.text();
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
