view.feedbacker = {
  /**
   * The extension send the request to show the
   * feedback for the submission.
   *
   * @param {Object} submissionResponseData the response from the
   * server after tracking data was processed
   */
  showFeedback: function(submissionResponseData) {
    const $Dialog = $("<div>");
    $Dialog.attr("id", "view-feedback-dialog");

    const performanceData = submissionResponseData.performance;
    const feedbackData = submissionResponseData.feedback;

    view.feedbacker.addSubmissionResponseData($Dialog, performanceData, feedbackData);

    const isModal = false;
    const title = "Feedback";
    const height = "auto";
    const position = {
      my: "left top",
      at: "right bottom",
      of: "#" + performanceData["enhancement-id"]
    };
    const buttons = {};

    view.lib.dialogSetup(isModal, $Dialog, title, height, position, buttons);

    view.lib.initDialogClose($Dialog);
  },

  /**
   * Add performance and feedback data to the given dialog.
   *
   * @param {Object} $Dialog the dialog the task data is added to
   * @param {Object} performanceData the performance data to add
   * @param {Object} feedbackData the feedback data to add
   */
  addSubmissionResponseData: function($Dialog, performanceData, feedbackData) {
    const enhancementId = performanceData["enhancement-id"];
    const infoArray = ["Number of tries: " + performanceData["number-of-tries"]];

    if(feedbackData){
      infoArray.push("Assessment: " + feedbackData["assessment"]);
      infoArray.push("Message: " + feedbackData["message"]);
    }
    else{
      infoArray.push("Assessment: " + performanceData["assessment"]);
    }

    $Dialog.append(view.lib.createList(enhancementId + "-info", infoArray));
  }
};