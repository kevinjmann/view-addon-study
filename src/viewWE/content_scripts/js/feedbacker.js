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

    const position = view.feedbacker.decideDialogPosition(performanceData["enhancement-id"]);

    const settings = {
      title: "Feedback",
      width: "auto",
      height: "auto",
      maxHeight: $(window).height() * 0.40,
      position: position
    };

    view.lib.dialogSetup($Dialog, settings);

    view.lib.initDialogClose($Dialog);

    view.feedbacker.initFeedbackRuleBtn();

    view.feedbacker.initFeedbackHintBtn(position);

    $("#feedback-hint-btn-1").show();
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

    infoArray.push("Assessment: " + view.assessment[feedbackData["assessment"]]);
    infoArray.push("Message: " + feedbackData["message"]);

    $Dialog.append(view.lib.createList(enhancementId + "-info", infoArray));
  },

  /**
   * Decide the dialog position relative to the position of the
   * enhancement element:
   * - dialog is at the bottom, if the enhancement element is above
   * the center of the window
   * - dialog is at the top otherwise
   *
   * @param enhancementId the id of the enhancement element
   * @returns {object} the position of the dialog
   */
  decideDialogPosition: function(enhancementId) {
    const elementYPosition = $("#" + enhancementId).offset().top;
    const currentTop = $(window).scrollTop();
    const windowCenter = $(window).height() * 0.45;
    const centerYPosition = currentTop + windowCenter;

    if(elementYPosition < centerYPosition){
      return {
        my: "left bottom",
        at: "left top",
        of: "#view-toolbar-iframe"
      };
    }
    else {
      return {
        my: "left top",
        at: "left top",
        of: window
      };
    }
  },

  /**
   * Initialize the click handler for the feedback rule button.
   */
  initFeedbackRuleBtn: function() {
    $("#feedback-rule-btn").on("click", view.feedbacker.toggleFeedbackRule);
  },

  /**
   * Toggle the feedback rule.
   */
  toggleFeedbackRule: function() {
    $("#feedback-rule").toggle();
  },

  /**
   * Initialize the click handler for the feedback hint button.
   *
   * @param position the position of the feedback dialog
   */
  initFeedbackHintBtn: function(position) {
    $(".feedback-hint-btn").on("click", function() {
      view.feedbacker.toggleHintAndShowNextHintBtn($(this).data("feedback-level"), position);
    });
  },

  /**
   * Toggle the feedback hint and show the next feedback hint button.
   * Scroll down, so that the hint can be seen.
   *
   * @param feedbackLevel the level of the feedback
   * @param position the position of the feedback dialog
   */
  toggleHintAndShowNextHintBtn: function(feedbackLevel, position) {
    const $FeedbackHint = $("#feedback-hint-" + feedbackLevel);

    $FeedbackHint.toggle();
    $("#feedback-hint-btn-" + (feedbackLevel+1)).show();

    const $Dialog = $("#view-feedback-dialog");

    $Dialog.dialog("option", "position", position);

    view.lib.scrollToElement($FeedbackHint, $Dialog);
  }
};