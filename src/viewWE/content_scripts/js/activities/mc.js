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

    const exercises = view.activityHelper.chooseWhichExercises(hitList);

    view.mc.createExercises(numExercises, exercises, hitList);

    const $Body = $("body");

    $Body.on("change", "select.viewinput", view.activityHelper.inputHandler);
    $Body.on("click", "viewhint", view.activityHelper.hintHandler);
  },

  /**
   * Create exercises for the activity.
   *
   * @param {number} numExercises the number of exercises
   * @param {object} exercises first offset and interval size values
   * @param {Array} hitList list of hits that could be turned into exercises
   */
  createExercises: function(numExercises, exercises, hitList) {
    let i = exercises.firstOffset;

    for (; numExercises > 0 && i < hitList.length; i += exercises.intervalSize) {
      const $hit = hitList[i];
      const hitText = $hit.text().trim();

      // if the span is inside a link, skip (drop-down boxes are weirder
      // than text input boxes, need to investigate further)
      if ($hit.parents("a").length > 0) {
        continue;
      }

      const capType = view.lib.detectCapitalization(hitText);

      const options = view.mc.getOptions($hit, capType);

      const answer = view.activityHelper.getCorrectAnswer($hit);

      view.mc.createSelectBox(options, hitText, answer, $hit);

      view.activityHelper.createHint($hit);

      numExercises--;
    }
  },

  /**
   * Gets the options provided by the server in the distractors attribute.
   */
  getOptions: function($hit, capType) {
    const options = [];
    let j = 0;

    if (view.language === "ru") {
      // Get the list of distractors for the given hit
      const distractors = $hit.data("distractors").split(" ");

      // Add the distractor forms to the options list:
      while (j < distractors.length && options.length < 4) {
        // The forms that are homonymous to the correct form are excluded from the list of options:
        if (distractors[j].toLowerCase() != $hit.data("correctform").toLowerCase() && distractors[j] != "") {
          options.push(view.lib.matchCapitalization(distractors[j], capType));
        }
        j++;
      }
    }
    else {
      // Get the list of distractors for the given hit
      const distractors = $hit.data("data-distractors");

      // Add the distractor forms to the options list:
      while (j < distractors.length && options.length < 4) {
        if (distractors[j].toLowerCase() != $hit.text().toLowerCase() && distractors[j] != "") {
          options.push(view.lib.matchCapitalization(distractors[j], capType));
        }
        j++;
      }
    }

    options.push(view.lib.matchCapitalization($hit.data("correctform"), capType));
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