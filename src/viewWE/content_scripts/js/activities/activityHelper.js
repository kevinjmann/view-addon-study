view.activityHelper = {
  /**
   * Deals with the input in the mc and cloze activities.
   */
  inputHandler: function() {
    let countsAsCorrect = false;
    const $Element = $(this);

    const userid = view.userid;
    let infos = {};

    if (userid) {
      // collect info data before page update
      infos = view.collector.collectInfoData(
        $Element,
        false
      );
    }

    // if the answer is correct, turn into text, else color text within input
    if ($Element.val().toLowerCase() == $Element.data("view-answer").toLowerCase()) {
      countsAsCorrect = true;
      view.activityHelper.processCorrect($Element, "Correct");

    } else {
      view.activityHelper.processIncorrect($Element);
    }

    if (userid) {
      const info = infos.info;
      const elementInfo = infos.elementInfo;

      // collect and send interaction data after page update
      view.collector.collectInteractionData(
        info,
        elementInfo,
        countsAsCorrect,
        false
      );
    }

    // prevent execution of further event listeners
    return false;
  },

  /**
   * Process the correct input.
   *
   * @param {object} $Element the element the input came from
   * @param {string} clozeStyleType either "Correct" or "Provided"
   */
  processCorrect: function($Element, clozeStyleType) {
    const inputId = $(".viewinput").index($Element);

    // return the clue tag color to what it was originally
    $("#" + $Element.data("clueid")).css("color", "inherit");

    const $text = $("<viewenhancement>");
    $text.addClass("clozeStyle" + clozeStyleType);
    $text.text($Element.data("view-answer"));
    // save the original text in a hidden field
    $text.data("view-original-text", $Element.data("view-original-text"));

    view.lib.replaceInput($Element.parent(), $text);

    view.activityHelper.jumpTo(inputId);
  },

  /**
   * Process the incorrect input.
   *
   * @param {object} $Element the element the input came from
   */
  processIncorrect: function($Element) {
    // give the clue tag a color if the student guessed wrong
    $("#" + $Element.data("clueid")).css("color", "red");

    // turns all options, the topmost element after selection included, as red
    $Element.addClass("clozeStyleIncorrect");
    // remove assigned classes to all options from previous selections
    $Element.find("option").removeAttr("class");
    // turn the selected option red
    $Element.find("option:selected").addClass("clozeStyleIncorrect");
    // turn the not selected options black
    $Element.find("option:not(:selected)").addClass("clozeStyleNeutral");
  },

  /**
   * Deals with the hint in the mc and cloze activities.
   */
  hintHandler: function() {
    const $Element = $(this);

    const userid = view.userid;
    let infos = {};

    if (userid) {	// if the user is logged in (userid is not null)
      // collect info data before page update
      infos = view.collector.collectInfoData(
        $Element,
        true
      );
    }

    view.activityHelper.processCorrect($Element.prev(), "Provided");

    if (userid) {	// if the user is logged in (userid is not null)
      const info = infos.info;
      const elementInfo = infos.elementInfo;

      // collect and send interaction data after page update
      view.collector.collectInteractionData(
        info,
        elementInfo,
        true,
        true
      );
    }

    // prevent execution of further event listeners
    return false;
  },

  /**
   * Jump to the
   * - input element if it exists
   * - first input element if it exists
   *
   * @param {number} inputId the input id we currently at
   */
  jumpTo: function(inputId) {
    const $Input = $(".viewinput:eq(" + inputId + ")");
    const $FirstInput = $(".viewinput:eq(0)");

    if ($Input.length) {
      view.activityHelper.scrollToCenter($Input);
    }
    else if ($FirstInput.length) {
      view.activityHelper.scrollToCenter($FirstInput);
    }
  },

  /**
   * Scroll to the middle of the viewport relative to the element.
   *
   * @param $Element the element in focus and center
   */
  scrollToCenter: function($Element) {
    const $Window = $(window);

    $Element.focus();

    $Window.scrollTop($Element.offset().top - ($Window.height() / 2));
  },

  /**
   * Get the correct answer for the mc and cloze activities.
   */
  getCorrectAnswer: function($hit) {
    if (view.language === "ru") {
      return $hit.data("correctform");
    }
    else {
      return $hit.text().trim();
    }
  },

  /**
   * Remove activity specific markup.
   */
  restore: function() {
    console.log("restore()");

    const $Body = $("body");

    // click
    $Body.off("click", "viewenhancement");

    // mc
    $Body.off("change", "select.viewinput");
    $Body.off("click", "viewhint");

    // cloze
    $Body.off("change", "input.viewinput");

    // cloze
    $("viewbaseform").remove();

    // mc and cloze
    $("viewhint").remove();
  }
};