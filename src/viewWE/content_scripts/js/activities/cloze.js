view.cloze = {
  /**
   * Run the cloze activity.
   */
  run: function() {
    console.log("cloze()");

    const hitList = view.activityHelper.createHitList();

    view.cloze.handler(hitList);
  },

  /**
   * Generate cloze exercises. TODO BUG: When typing an answer into the input field and then pressing on the
   * hint right away, both the typed answer and the hint event are triggered at the same time and send to the server.
   */
  handler: function(hitList) {
    console.log("handler(hitList)");

    const numExercises = view.activityHelper.calculateNumberOfExercises(hitList);

    const exerciseOptions = view.activityHelper.chooseWhichExercises(hitList);

    view.cloze.createExercises(numExercises, exerciseOptions, hitList);

    const $Body = $("body");

    $Body.on("change", "input.viewinput", view.activityHelper.inputHandler);
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

      const capType = view.lib.detectCapitalization($hit.text().trim());

      const answer = view.activityHelper.getCorrectAnswer($hit, capType);

      view.cloze.createInputBox(answer, $hit);

      view.activityHelper.createHint($hit);

      view.cloze.addBaseform($hit);

      numExercises--;
    }
  },

  /**
   * Create the input box.
   *
   * @param {string} answer the correct answer
   * @param {object} $hit the enhancement tag the select box is designed for
   */
  createInputBox: function(answer, $hit) {
    // create input box
    const $input = $("<input>");
    $input.data("view-original-text", $hit.text().trim());
    $input.attr("type", "text");
    // average of 10 px per letter (can fit 10 x "м" with a width of 110)
    $input.css("width", (answer.length * 10) + "px");
    $input.addClass("clozeStyleInput");
    $input.addClass("viewinput");
    $input.data("view-answer", answer);

    $hit.empty();
    $hit.append($input);
  },

  /**
   * Add the baseform (lemma) next to
   * the input field.
   */
  addBaseform: function($hit) {
    const $baseform = $("<viewbaseform>");
    $baseform.addClass("clozeStyleBaseform");
    const lemmaform = $hit.data("lemma");
    if (lemmaform) {
      $baseform.text(" (" + lemmaform + ")");
      $hit.append($baseform);
    }
  }
};