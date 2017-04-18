view.feedbacker = {
  /**
   * The extension send the request to show the
   * current performance to the user.
   */
  showPerformance: function(performanceData) {
    const $Dialog = $("<div>");
    $Dialog.attr("id", "view-performance-dialog");

    view.feedbacker.addPerformanceData($Dialog, performanceData);

    const isModal = false;
    const title = "Performance";
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
   * Add performance data to the given dialog using the performance
   * data.
   *
   * @param {Object} $Dialog the dialog the task data is added to
   * @param {Object} performanceData the performance data to add
   */
  addPerformanceData: function($Dialog, performanceData) {
    const enhancementId = performanceData["enhancement-id"];

    const $InfoList = view.lib.createList(enhancementId + "-info", [
      "Number of tries: " + performanceData["number-of-tries"],
      "Assessment: " + performanceData["assessment"]
    ]);

    $Dialog.append($InfoList);
  }
};