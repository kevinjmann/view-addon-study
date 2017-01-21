view.mc = {
  /**
   * Run the multiple choice activity.
   */
  run: function() {
    const hitList = view.activityHelper.createHitList();

    view.mc.handler(hitList);
  },

  /**
   * Generate multiple choice exercises.
   *
   * @param {Array} hitList list of hits that could be turned into exercises
   */
  handler: function(hitList) {
    const numExercises = view.activityHelper.calculateNumberOfExercises(hitList);

    const exerciseOptions = view.activityHelper.chooseWhichExercises(hitList);

    view.activityHelper.createExercises(
      numExercises,
      exerciseOptions,
      hitList,
      view.mc.createExercise
    );

    const $Body = $("body");

    $Body.on("change", "select.viewinput", view.activityHelper.inputHandler);
    $Body.on("click", "viewhint", view.activityHelper.hintHandler);
  },

  /**
   * Create an exercise for the enhancement element.
   *
   * @param {object} $hit the enhancement element the exercise is created for
   */
  createExercise: function($hit) {

    const hitText = $hit.text().trim();

    const capType = view.lib.detectCapitalization(hitText);

    const answer = view.activityHelper.getCorrectAnswer($hit, capType);

    const options = view.mc.getOptions($hit, answer, capType);

    view.mc.createSelectBox(options, hitText, answer, $hit);

    view.activityHelper.createHint($hit);
  },

  /**
   * Gets the options provided by the server in the distractors attribute.
   *
   * @param {object} $hit the enhancement element the select box is designed for
   * @param {string} answer the correct answer
   * @param {number} capType the capitalization type of the original word
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
   * @param {number} capType the capitalization type of the original word
   */
  fillOptions: function(distractors, answer, capType) {
    const options = [];
    let j = 0;

    while (j < distractors.length && options.length < 4) {
      const distractor = distractors[j];
      if (distractor.toLowerCase() != answer.toLowerCase()) {
        view.mc.addOption(options, distractor, capType);
      }
      j++;
    }
    view.mc.addOption(options, answer, capType);
    view.lib.shuffleList(options);

    return options;
  },

  /**
   * Add an option with correct capitalization to all options.
   *
   * @param {Array} options all other options
   * @param {string} option the option to add
   * @param {number} capType the capitalization type of the original word
   */
  addOption: function(options, option, capType) {
    options.push(view.lib.matchCapitalization(option, capType));
  },

  /**
   * Create the select box with distractors as options.
   *
   * @param {Array} options the selection options
   * @param {string} hitText the original text of the enhancement tag
   * @param {string} answer the correct answer
   * @param {object} $hit the enhancement element the select box is designed for
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

    $SelectBox.data("view-answer", answer);

    $hit.empty();
    $hit.append($SelectBox);
  }
};