view.color = {
  /**
   * Run the colorize activity.
   * Add css attribute color to span marked as hit.
   */
  run: function(topicCSS) {
    console.log("color()");

    $("viewenhancement[data-type='hit'], " +
      "viewenhancement[data-type='ambiguity']").each(function() {
      const $Enhancement = $(this);
      $Enhancement.data("vieworiginaltext", $Enhancement.text().trim());

      $Enhancement.addClass("colorizeStyle" + topicCSS);
    });
  }
};