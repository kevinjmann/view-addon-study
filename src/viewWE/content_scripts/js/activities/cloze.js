view.cloze = {
  /**
   * Run the cloze activity.
   * Get all potential spans and call the clozeHandler.
   */
  run: function() {
    console.log("cloze()");
    // get potential spans
    const $Hits = $("viewenhancement[data-type='hit']");

    const hitList = [];
    $Hits.each(function() {
      const $Hit = $(this);
      $Hit.data("vieworiginaltext", $Hit.text().trim());

      hitList.push($(this));
    });

    view.cloze.handler(hitList);
  },

  /**
   * Generate cloze exercises. TODO BUG: When typing an answer into the input field and then pressing on the
   * hint right away, both the typed answer and the hint event are triggered at the same time and send to the server.
   */
  handler: function(hitList) {
    console.log("handler(hitList)");

    const fixedOrPercentageValue = view.fixedOrPercentage;
    const fixedNumberOfExercises = view.fixedNumberOfExercises;
    const percentageOfExercises = view.percentageOfExercises;
    const choiceModeValue = view.choiceMode;
    const firstOffset = view.firstOffset;
    const intervalSize = view.intervalSize;

    // calculate the number of hits to turn into exercises
    let numExercises = 0;
    if (fixedOrPercentageValue == 0) {
      numExercises = fixedNumberOfExercises;
    }
    else if (fixedOrPercentageValue == 1) {
      numExercises = percentageOfExercises * hitList.length;
    }
    else {
      // we should never get here
      view.lib.prefError();
    }

    // choose which hits to turn into exercises
    let i = 0;
    let inc = 1;
    if (choiceModeValue == 0) {
      view.lib.shuffleList(hitList);
    }
    else if (choiceModeValue == 1) {
      i = firstOffset;
    }
    else if (choiceModeValue == 2) {
      inc = intervalSize;
    }
    else {
      // we should never get here
      view.lib.prefError();
    }

    // override preferences for Konjunktiv
    if (view.topicName === "Konjunktiv") {
      numExercises = hitList.length;
      i = 0;
      inc = 1;
    }

    // generate the exercises
    for (; numExercises > 0 && i < hitList.length; i += inc) {
      const $hit = hitList[i];
      const hitText = $hit.text().trim();

      // correct choice
      const answer = view.activityHelper.getCorrectAnswer($hit);

      // create input box
      const $input = $("<input>");
      $input.data("vieworiginaltext", hitText);
      $input.attr("type", "text");
      // average of 10 px per letter (can fit 10 x "м" with a width of 110)
      $input.css("width", (answer.length * 10) + "px");
      $input.addClass("clozeStyleInput");
      $input.addClass("viewinput");
      $input.data("viewanswer", answer);

      $hit.empty();
      $hit.append($input);

      // create hint ? button
      const $hint = $("<viewhint>");
      $hint.text("?");
      $hit.append($hint);

      view.cloze.addBaseform($hit);

      numExercises--;
    }

    const $Body = $("body");

    $Body.on("change", "input.viewinput", view.activityHelper.inputHandler);
    $Body.on("click", "viewhint", view.activityHelper.hintHandler);
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