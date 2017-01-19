view.mc = {
  /**
   * Run the multiple choice activity.
   */
  run: function() {
    console.log("mc()");

    const hitList = view.activityHelper.createHitList();

    view.mc.handler(hitList);
  },

  /**
   * Generate multiple choice exercises.
   *
   * @param {Array} hitList list of hits that could be turned into exercises
   */
  handler: function(hitList) {
    console.log("handler(hitList)");

    const numExercises = view.activityHelper.calculateNumberOfExercises(hitList);

    const exerciseOptions = view.activityHelper.chooseWhichExercises(hitList);

    view.mc.createExercises(numExercises, exerciseOptions, hitList);

    const $Body = $("body");

    $Body.on("change", "select.viewinput", view.activityHelper.inputHandler);
    $Body.on("click", "viewhint", view.activityHelper.hintHandler);
  },

  /**
   * Create exercises for the activity.
   *
   * @param {number} numExercises the number of exercises
   * @param {object} exerciseOptions first offset and interval size values
   * @param {Array} hitList list of hits that could be turned into exercises
   */
  createExercises: function(numExercises, exerciseOptions, hitList) {
    let i = exerciseOptions.firstOffset;

    for (; numExercises > 0 && i < hitList.length; i += exerciseOptions.intervalSize) {
      const $hit = hitList[i];
      const hitText = $hit.text().trim();

      // if the span is inside a link, skip (drop-down boxes are weirder
      // than text input boxes, need to investigate further)
      if ($hit.parents("a").length > 0) {
        continue;
      }

      const capType = view.lib.detectCapitalization(hitText);

      const answer = view.activityHelper.getCorrectAnswer($hit);

      const options = view.mc.getOptions($hit, answer, capType);

      view.mc.createSelectBox(options, hitText, answer, $hit);

      view.activityHelper.createHint($hit);

      numExercises--;
    }
  },

  /**
   * Gets the options provided by the server in the distractors attribute.
   *
   * @param {object} $hit the enhancement tag the select box is designed for
   * @param {string} answer the correct answer
   * @param {number} capType the capitalization type
   * @returns {Array} the options
   */
  getOptions: function($hit, answer, capType) {
    if (view.language === "ru") {
      const distractors = $hit.data("distractors").split(";");

      return view.mc.fillOptions(distractors, answer, capType);
    }
    else {
      const distractors = $hit.data("data-distractors");

      return view.mc.fillOptions(distractors, answer, capType);
    }
  },

  /**
   * Add the distractor forms to the options.
   * @param {Array} distractors the distractor forms
   * @param {string} answer the correct answer
   * @param {number} capType the capitalization type
   */
  fillOptions: function(distractors, answer, capType) {
    const options = [];
    let j = 0;

    while (j < distractors.length && options.length < 4) {
      if (distractors[j].toLowerCase() != answer.toLowerCase()) {
        options.push(view.lib.matchCapitalization(distractors[j], capType));
      }
      j++;
    }
    options.push(view.lib.matchCapitalization(answer, capType));
    view.lib.shuffleList(options);

    return options;
  },

  /**
   * Create the select box with distractors as options.
   *
   * @param {Array} options the selection options
   * @param {string} hitText the original text of the enhancement tag
   * @param {string} answer the correct answer
   * @param {object} $hit the enhancement tag the select box is designed for
   */
  createSelectBox: function(options, hitText, answer, $hit) {
    const $SelectBox = $("<select>");
    $SelectBox.addClass("viewinput");
    let $option = $("<option>");
    $option.html(" ");
    $SelectBox.append($option);
    for (let j = 0; j < options.length; j++) {
      $option = $("<option>");
      $option.text(options[j]);
      $SelectBox.append($option);
    }

    $SelectBox.data("view-original-text", hitText);
    $SelectBox.data("view-answer", answer);

    $hit.empty();
    $hit.append($SelectBox);
  }
};