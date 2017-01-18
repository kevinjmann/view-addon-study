view.color = {
  /**
   * Run the colorize activity.
   */
  run: function(topicCSS) {
    console.log("color()");

    $("viewenhancement[data-type='hit'], " +
      "viewenhancement[data-type='ambiguity']").each(function() {
      const $Enhancement = $(this);
      $Enhancement.data("view-original-text", $Enhancement.text().trim());

      $Enhancement.addClass("colorizeStyle" + topicCSS);
    });
  }
};