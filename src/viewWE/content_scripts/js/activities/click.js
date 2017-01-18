view.click = {
  /**
   * Run the click activity.
   * Ignore instruction dialogs.
   * Add css attribute cursor: pointer to each span marked as token.
   * Call the click handler when the span marked as token was clicked.
   */
  run: function() {
    console.log("click()");

    $("viewenhancement").each(function() {
      const $Enhancement = $(this);
      $Enhancement.data("vieworiginaltext", $Enhancement.text().trim());

      $Enhancement.addClass("clickStylePointer");
    });

    $("body").on("click", "viewenhancement", view.click.handler);
  },

  /**
   * Turn correctly clicked hits green and incorrect ones red.
   */
  handler: function() {
    let countsAsCorrect = false;
    const element = this;

    if ($(element).is("[data-type='hit']")) {
      countsAsCorrect = true;
      $(element).addClass("clickStyleCorrect");
    } else {
      $(element).addClass("clickStyleIncorrect");
    }

    $(element).removeClass("clickStylePointer");

    if (view.userid) {
      // collect info data before page update
      const infos = view.collector.collectInfoData(
        element,
        false
      );

      // collect and send interaction data after page update
      view.collector.collectInteractionData(
        infos.info,
        infos.elementInfo,
        countsAsCorrect,
        false
      ); // usedHint: only true when hint handler
    }

    // prevent execution of further event listeners
    return false;
  }
};