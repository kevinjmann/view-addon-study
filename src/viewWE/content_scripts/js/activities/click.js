view.click = {
  /**
   * Run the click activity.
   */
  run: function() {
    const $Enhancements = $("viewenhancement");

    $Enhancements.addClass("click-style-pointer");

    view.activityHelper.getNumberOfExercisesAndRequestTaskId("viewenhancement[data-type!='miss'].selected");

    $Enhancements.on("click", view.click.handler);
  },

  /**
   * Turn correctly clicked hits green and incorrect ones red.
   */
  handler: function() {
    const timestamp = Date.now();
    view.activityHelper.setTimestamp(timestamp);

    let isCorrect = false;
    const $EnhancementElement = $(this);
    const usedSolution = false;

    if ($EnhancementElement.is("viewenhancement[data-type!='miss'].selected")) {
      isCorrect = true;
      $EnhancementElement.addClass("click-style-correct");
    } else {
      $EnhancementElement.addClass("click-style-incorrect");
    }

    $EnhancementElement.removeClass("click-style-pointer");

    view.tracker.trackData(
      $EnhancementElement,
      $EnhancementElement.text(),
      isCorrect,
      usedSolution
    );

    $EnhancementElement.off("click");
  }
};