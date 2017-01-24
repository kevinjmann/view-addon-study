view.click = {
  /**
   * Run the click activity.
   */
  run: function() {
    $("viewenhancement").each(function() {
      const $EnhancementElement = $(this);
      $EnhancementElement.data("view-original-text", $EnhancementElement.text().trim());

      $EnhancementElement.addClass("click-style-pointer");
    });

    $("body").on("click", "viewenhancement", view.click.handler);
  },

  /**
   * Turn correctly clicked hits green and incorrect ones red.
   */
  handler: function() {
    let countsAsCorrect = false;
    const $EnhancementElement = $(this);
    const usedHint = false;

    if ($EnhancementElement.is("[data-type!='miss']")) {
      countsAsCorrect = true;
      $EnhancementElement.addClass("click-style-correct");
    } else {
      $EnhancementElement.addClass("click-style-incorrect");
    }

    $EnhancementElement.removeClass("click-style-pointer");

    if (view.userid) {
      view.collector.collectAndSendData(
        $EnhancementElement,
        $EnhancementElement.text().trim(),
        countsAsCorrect,
        usedHint
      );
    }

    // prevent execution of further event listeners
    return false;
  }
};