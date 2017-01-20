view.activityHelper = {
  /**
   * Create a hit list from all enhancements.
   */
  createHitList: function() {
    const $Hits = $("viewenhancement[data-type='hit']");
    const $Clues = $("viewenhancement[data-type='clue']");

    const hitList = [];

    $Hits.each(function() {
      const $Hit = $(this);
      $Hit.data("view-original-text", $Hit.text().trim());

      hitList.push($Hit);
    });

    $Clues.each(function() {
      const $Clue = $(this);
      $Clue.data("view-original-text", $Clue.text().trim());
    });

    return hitList;
  },

  /**
   * Calculate the number of hits to turn into exercises
   *
   * @param {Array} hitList list of hits that could be turned into exercises
   * @returns {number} the number of exercises
   */
  calculateNumberOfExercises: function(hitList) {
    if (view.fixedOrPercentage === "0") {
      return view.fixedNumberOfExercises;
    }
    else {
      return view.percentageOfExercises / 100 * hitList.length;
    }
  },

  /**
   * Choose which hits to turn into exercises.
   *
   * @param {Array} hitList list of hits that could be turned into exercises
   * @returns {object} first offset and interval size values
   */
  chooseWhichExercises: function(hitList) {
    const choiceModeValue = view.choiceMode;

    const exercises = {};

    // defaults
    exercises.firstOffset = 0;
    exercises.intervalSize = 1;

    if (choiceModeValue === "0") {
      view.lib.shuffleList(hitList);
    }
    else if (choiceModeValue === "1") {
      exercises.firstOffset = view.firstOffset;
    }
    else {
      exercises.intervalSize = view.intervalSize;
    }

    return exercises;
  },

  /**
   * Get the correct answer for the mc and cloze activities.
   *
   * @param {object} $hit the enhancement tag the select box is designed for
   * @param {number} capType the capitalization type
   */
  getCorrectAnswer: function($hit, capType) {
    if (view.language === "ru") {
      return view.lib.matchCapitalization($hit.data("correctform"), capType);
    }
    else {
      return $hit.text().trim();
    }
  },

  /**
   * Create the hint visible as "?".
   *
   * @param {object} $hit the enhancement tag the select box is designed for
   */
  createHint: function($hit) {
    const $hint = $("<viewhint>");
    $hint.addClass("view-style-hint");
    $hint.text("?");
    $hit.append($hint);
  },

  /**
   * Deals with the input in the mc and cloze activities.
   */
  inputHandler: function() {
    let countsAsCorrect = false;
    const $Element = $(this);
    const $Enhancement = $Element.parent();
    const input = $Element.val();

    // if the answer is correct, turn into text, else color text within input
    if (input.toLowerCase() === $Element.data("view-answer").toLowerCase()) {
      countsAsCorrect = true;
      view.activityHelper.processCorrect($Element, "correct");
    }
    else {
      view.activityHelper.processIncorrect($Element);
    }

    if (view.userid) {
      view.collector.collectAndSendData(
        $Enhancement,
        input,
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
   * @param {string} inputStyleType either "correct" or "provided"
   */
  processCorrect: function($Element, inputStyleType) {
    const $Enhancement = $Element.parent();
    const inputId = $(".viewinput").index($Element);

    // return the clue tag color to what it was originally
    $("[data-id='" + $Enhancement.data("clueid") + "']").css("color", "inherit");

    $Enhancement.addClass("input-style-" + inputStyleType);
    $Enhancement.html($Element.data("view-answer"));

    view.activityHelper.jumpTo(inputId);
  },

  /**
   * Process the incorrect input.
   *
   * @param {object} $Element the element the input came from
   */
  processIncorrect: function($Element) {
    // give the clue tag a color if the student guessed wrong
    $("[data-id='" + $Element.parent().data("clueid") + "']").css("color", "red");

    // turns all options, the topmost element after selection included, as red
    $Element.addClass("input-style-incorrect");
    // remove assigned classes to all options from previous selections
    $Element.find("option").removeAttr("class");
    // turn the selected option red
    $Element.find("option:selected").addClass("input-style-incorrect");
    // turn the not selected options black
    $Element.find("option:not(:selected)").addClass("input-style-neutral");
  },

  /**
   * Deals with the hint in the mc and cloze activities.
   */
  hintHandler: function() {
    const $Element = $(this).prev();
    const $Enhancement = $Element.parent();

    view.activityHelper.processCorrect($Element, "provided");

    if (view.userid) {
      view.collector.collectAndSendData(
        $Enhancement,
        "no input",
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
   * Remove activity specific markup.
   */
  restore: function() {
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