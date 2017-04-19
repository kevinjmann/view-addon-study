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
      trackingData["sentence"] = view.tracker.extractRawSentenceWithMarkedElement(
        $EnhancementElement,
        enhancementId
      );
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
   * @param {object} $EnhancementElement the current enhancement element
   * @param {string} enhancementId the id of the enhancement element
   *
   * @return {string} the raw sentence with the marked element
   */
  extractRawSentenceWithMarkedElement: function($EnhancementElement, enhancementId) {
    const $OriginalSentence = $EnhancementElement.closest("sentence");
    const $NewSentence = $("<sentence>").html($OriginalSentence.html());

    $NewSentence.find("#" + enhancementId)
    .replaceWith("STARTñôŃßĘńŠē" + $EnhancementElement.data("original-text") + "ñôŃßĘńŠēEND");

    $NewSentence.find("viewenhancement").each(function() {
      const $Element = $(this);
      $Element.replaceWith($Element.data("original-text"));
    });

    $NewSentence.find("*").each(function() {
      const $Element = $(this);
      $Element.replaceWith($Element.text());
    });

    const newSentenceContent = $NewSentence.text()
    .replace(/STARTñôŃßĘńŠē/g, "<viewenhancement>")
    .replace(/ñôŃßĘńŠēEND/g, "</viewenhancement>");

    $NewSentence.html(newSentenceContent);

    return $NewSentence.html();
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
