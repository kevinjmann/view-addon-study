view.click = {
  /**
   * Run the click activity.
   */
  run: function() {
    console.log("click()");

    $("viewenhancement").each(function() {
      const $Enhancement = $(this);
      $Enhancement.data("view-original-text", $Enhancement.text().trim());

      $Enhancement.addClass("clickStylePointer");
    });

    $("body").on("click", "viewenhancement", view.click.handler);
  },

  /**
   * Turn correctly clicked hits green and incorrect ones red.
   */
  handler: function() {
    let countsAsCorrect = false;
    const $Element = $(this);

    if ($Element.is("[data-type='hit']")) {
      countsAsCorrect = true;
      $Element.addClass("clickStyleCorrect");
    } else {
      $Element.addClass("clickStyleIncorrect");
    }

    $Element.removeClass("clickStylePointer");

    if (view.userid) {
      view.collector.collectAndSendData(
        $Element,
        $Element.text().trim(),
        countsAsCorrect,
        false
      );
    }

    // prevent execution of further event listeners
    return false;
  }
};