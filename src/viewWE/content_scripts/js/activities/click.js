view.click = {
  /**
   * Run the click activity.
   */
  run: function() {
    $("viewenhancement").each(function() {
      const $EnhancementElement = $(this);
      $EnhancementElement.data("view-original-text", $EnhancementElement.text());

      $EnhancementElement.addClass("click-style-pointer");
    });

    view.activityHelper.getNumberOfExercisesAndRequestSessionId("viewenhancement[data-type!='miss']");

    $("viewenhancement").on("click", view.click.handler);
  },

  /**
   * Turn correctly clicked hits green and incorrect ones red.
   */
  handler: function() {
    const timestamp = Date.now();
    view.setTimestamp(timestamp);

    let isCorrect = false;
    const $EnhancementElement = $(this);
    const usedHint = false;

    if ($EnhancementElement.is("[data-type!='miss']")) {
      isCorrect = true;
      $EnhancementElement.addClass("click-style-correct");
    } else {
      $EnhancementElement.addClass("click-style-incorrect");
    }

    $EnhancementElement.removeClass("click-style-pointer");

    if (view.userid) {
      view.tracker.trackData(
        $EnhancementElement,
        $EnhancementElement.text(),
        isCorrect,
        usedHint
      );
    }

    // prevent execution of further event listeners
    return false;
  }
};