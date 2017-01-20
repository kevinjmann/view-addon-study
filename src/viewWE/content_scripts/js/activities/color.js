view.color = {
  /**
   * Run the colorize activity.
   */
  run: function(topicCSS) {
    console.log("color()");

    $("viewenhancement").each(function() {
      const $Enhancement = $(this);
      $Enhancement.data("view-original-text", $Enhancement.text().trim());

      $Enhancement.addClass("colorize-style-" + topicCSS);
    });
  }
};