view.cloze = {
  /**
   * Run the cloze activity.
   */
  run: function() {
    const hitList = view.activityHelper.createHitList();

    view.activityHelper.exerciseHandler(hitList, view.cloze.createExercise);
  },

  /**
   * Create an exercise for the enhancement element.
   *
   * @param {object} $hit the enhancement element the exercise is created for
   */
  createExercise: function($hit) {

    const capType = view.lib.detectCapitalization($hit.text().trim());

    const answer = view.activityHelper.getCorrectAnswer($hit, capType);

    view.cloze.createInputBox(answer, $hit);

    view.activityHelper.createHint($hit);

    view.cloze.addBaseform($hit);
  },

  /**
   * Create the input box.
   *
   * @param {string} answer the correct answer
   * @param {object} $hit the enhancement element the input box is appended to
   */
  createInputBox: function(answer, $hit) {
    // create input box
    const $InputBox = $("<input>");
    $InputBox.addClass("viewinput");
    $InputBox.addClass("cloze-style-input");

    $InputBox.attr("type", "text");
    // average of 10 px per letter (can fit 10 x "м" with a width of 110)
    $InputBox.css("width", (answer.length * 10) + "px");

    $InputBox.data("view-answer", answer);

    $hit.empty();
    $hit.append($InputBox);
  },

  /**
   * Add the baseform (lemma) next to the input box.
   *
   * @param {object} $hit the enhancement element containing the input box
   */
  addBaseform: function($hit) {
    const $baseform = $("<viewbaseform>");
    $baseform.addClass("cloze-style-baseform");
    const lemmaform = $hit.data("lemma");
    if (lemmaform) {
      $baseform.text(" (" + lemmaform + ")");
      $hit.append($baseform);
    }
  }
};