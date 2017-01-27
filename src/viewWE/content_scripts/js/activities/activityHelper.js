view.activityHelper = {
  /**
   * Create a hit list from all enhancements.
   */
  createHitList: function() {
    const hitList = [];

    $("viewenhancement[data-type='hit']").each(function() {
      const $Hit = $(this);
      $Hit.data("view-original-text", $Hit.text());

      hitList.push($Hit);
    });

    $("viewenhancement[data-type='clue']").each(function() {
      const $Clue = $(this);
      $Clue.data("view-original-text", $Clue.text());
    });

    return hitList;
  },

  /**
   * Generate multiple choice or cloze exercises.
   *
   * @param {Array} hitList list of hits that could be turned into exercises
   * @param {function} createExercise either the mc or cloze createExercise
   * function.
   */
  exerciseHandler: function(hitList, createExercise) {
    const numExercises = view.activityHelper.calculateNumberOfExercises(hitList);

    const exerciseOptions = view.activityHelper.chooseWhichExercises(hitList);

    view.activityHelper.createExercises(
      numExercises,
      exerciseOptions,
      hitList,
      createExercise
    );

    view.activityHelper.getNumberOfExercisesAndRequestSessionId(".viewinput");

    $("viewhint").on("click", view.activityHelper.hintHandler);
  },

  /**
   * Calculate the number of hits to turn into exercises
   *
   * @param {Array} hitList list of hits that could be turned into exercises
   * @returns {number} the number of exercises
   */
  calculateNumberOfExercises: function(hitList) {
    if (view.fixedOrPercentage === 0) {
      return view.fixedNumberOfExercises;
    }
    else {
      return Math.round(view.percentageOfExercises / 100 * hitList.length);
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

    if (choiceModeValue === 0) {
      view.lib.shuffleList(hitList);
    }
    else if (choiceModeValue === 1) {
      exercises.firstOffset = view.firstOffset;
    }
    else {
      exercises.intervalSize = view.intervalSize;
    }

    return exercises;
  },

  /**
   * Create exercises for the activity.
   *
   * @param {number} numExercises the number of exercises
   * @param {object} exerciseOptions first offset and interval size values
   * @param {Array} hitList list of hits that could be turned into exercises
   * @param {function} createExercise the function to call to create an
   * exercise for the current activity
   */
  createExercises: function(numExercises, exerciseOptions, hitList, createExercise) {
    let exerciseNumber = exerciseOptions.firstOffset;

    for (; numExercises > 0 && exerciseNumber < hitList.length; exerciseNumber += exerciseOptions.intervalSize) {
      const $hit = hitList[exerciseNumber];
      createExercise($hit);
      numExercises--;
    }
  },

  /**
   * Use the selector to retrieve the number of exercises, save
   * the number and request the session id from the server.
   *
   * @param {string} selector the selector to get the length of
   */
  getNumberOfExercisesAndRequestSessionId: function(selector) {
    const numberOfExercises = $(selector).length;

    view.saveNumberOfExercises(numberOfExercises);

    view.requestToGetSessionId();
  },

  /**
   * Deals with the hint in the mc and cloze activities.
   */
  hintHandler: function() {
    const timestamp = Date.now();
    view.saveTimestamp(timestamp);

    const $ElementBox = $(this).prev();
    const $EnhancementElement = $ElementBox.parent();
    const input = $ElementBox.val() || "no input";
    const countAsCorrect = true;
    const usedHint = true;

    view.activityHelper.processCorrect($ElementBox, "provided");

    if (view.userid) {
      view.collector.collectAndSendData(
        $EnhancementElement,
        input,
        countAsCorrect,
        usedHint
      );
    }
  },

  /**
   * Deals with the input in the mc and cloze activities.
   *
   * @param {object} e the triggered event
   */
  inputHandler: function(e) {
    const timestamp = Date.now();
    view.saveTimestamp(timestamp);

    let countsAsCorrect = false;
    const $ElementBox = $(e.target);
    const $EnhancementElement = $ElementBox.parent();
    const input = $ElementBox.val();
    const usedHint = false;

    if (input.toLowerCase() === $ElementBox.data("view-answer").toLowerCase()) {
      countsAsCorrect = true;
      view.activityHelper.processCorrect($ElementBox, "correct");
    }
    else {
      view.activityHelper.processIncorrect($ElementBox);
    }

    if (view.userid) {
      view.collector.collectAndSendData(
        $EnhancementElement,
        input,
        countsAsCorrect,
        usedHint
      );
    }
  },

  /**
   * Process the correct input.
   *
   * @param {object} $ElementBox the select or input box
   * @param {string} inputStyleType either "correct" or "provided"
   */
  processCorrect: function($ElementBox, inputStyleType) {
    const $EnhancementElement = $ElementBox.parent();
    const elementId = $(".viewinput").index($ElementBox);

    view.activityHelper.colorClue($EnhancementElement.data("clueid"), "inherit");

    $EnhancementElement.addClass("input-style-" + inputStyleType);
    $EnhancementElement.html($ElementBox.data("view-answer"));

    view.activityHelper.jumpTo(elementId);
  },

  /**
   * Color the clue accordingly.
   *
   * @param {string} clueId the id of the clue to be colored
   * @param {string} clueStyleColor the color to use, either "inherit" or "red"
   */
  colorClue: function(clueId, clueStyleColor) {
    $("#" + clueId).css("color", clueStyleColor);
  },

  /**
   * Jump to the element if it exists and to the first element otherwise.
   *
   * @param {number} elementId the element id we currently at
   */
  jumpTo: function(elementId) {
    const $ElementBoxes = $(".viewinput");
    const $Element = $ElementBoxes.eq(elementId);
    const $FirstElement = $ElementBoxes.eq(0);

    if ($Element.length) {
      view.activityHelper.scrollToCenter($Element);
    }
    else {
      view.activityHelper.scrollToCenter($FirstElement);
    }
  },

  /**
   * Scroll to the middle of the viewport relative to the element.
   *
   * @param $Element the element to focus and center onto
   */
  scrollToCenter: function($Element) {
    const $Window = $(window);

    $Element.focus();

    $Window.scrollTop($Element.offset().top - ($Window.height() / 2));
  },

  /**
   * Process the incorrect input.
   *
   * @param {object} $ElementBox the select or input box
   */
  processIncorrect: function($ElementBox) {
    view.activityHelper.colorClue($ElementBox.parent().data("clueid"), "red");

    // turns all options, the topmost element after selection included, as red
    $ElementBox.addClass("input-style-incorrect");
    // remove assigned classes to all options from previous selections
    $ElementBox.find("option").removeAttr("class");
    // turn the selected option red
    $ElementBox.find("option:selected").addClass("input-style-incorrect");
    // turn the not selected options black
    $ElementBox.find("option:not(:selected)").addClass("input-style-neutral");
  },

  /**
   * Get the correct answer for the mc and cloze activities.
   *
   * @param {object} $hit the enhancement element
   * @param {number} capType the capitalization type of the original word
   */
  getCorrectAnswer: function($hit, capType) {
    if (view.language === "ru") {
      return view.lib.matchCapitalization($hit.data("correctform"), capType);
    }
    else {
      return $hit.text();
    }
  },

  /**
   * Create the hint visible as "?".
   *
   * @param {object} $hit the enhancement element the select box is designed for
   */
  createHint: function($hit) {
    const $hint = $("<viewhint>");
    $hint.addClass("view-style-hint");
    $hint.text("?");
    $hit.append($hint);
  },

  /**
   * Remove activity specific markup.
   */
  restore: function() {
    const $Hint = $("viewhint");

    // click
    $("viewenhancement").off("click");

    // mc and cloze
    $(".viewinput").off("change keyup");
    $Hint.off("click");
    $Hint.remove();

    // cloze
    $("viewbaseform").remove();
  }
};