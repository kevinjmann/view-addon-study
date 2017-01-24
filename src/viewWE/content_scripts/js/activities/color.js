view.color = {
  /**
   * Run the colorize activity.
   *
   * @param {string} topic the name of the topic.
   */
  run: function(topic) {
    $("viewenhancement").each(function() {
      const $Enhancement = $(this);
      $Enhancement.data("view-original-text", $Enhancement.text());

      $Enhancement.addClass("colorize-style-" + topic);
    });
  }
};