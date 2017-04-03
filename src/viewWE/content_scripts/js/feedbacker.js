view.feedbacker = {
  /**
   * The extension send the request to show the
   * current performance to the user.
   */
  showPerformance: function(performanceData) {
    const performance =
      "Number of tries: " + performanceData["number-of-tries"] + "<br>" +
      "Assessment: " + performanceData["assessment"];

    view.notification.add(performance);
  }
};