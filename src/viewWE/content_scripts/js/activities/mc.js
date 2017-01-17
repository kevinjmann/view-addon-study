view.mc = {
  /**
   * Run the multiple choice activity.
   * Get all potential spans and call the mcHandler.
   */
  run: function() {
    console.log("mc()");

    // get potential spans
    const $Hits = $("viewenhancement[data-type='hit']");

    const hitList = [];

    $Hits.each(function() {
      const $Hit = $(this);
      $Hit.data("vieworiginaltext", $Hit.text().trim());

      hitList.push($Hit);
    });

    view.mc.handler(hitList);
  },

  /**
   * Generate multiple choice exercises.
   *
   * @param hitList list of hits that could be turned into exercises,
   * unwanted instance must be removed in advance
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
      view.lib.prefError();
    }

    // generate the exercises
    for (; numExercises > 0 && i < hitList.length; i += inc) {
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


      // create select box
      const $input = $("<select>");
      $input.addClass("viewinput");
      let $option = $("<option>");
      $option.html(" ");
      $input.append($option);
      for (let j = 0; j < options.length; j++) {
        $option = $("<option>");
        $option.text(options[j]);
        $input.append($option);
      }

      $input.data("vieworiginaltext", hitText);
      $input.data("viewanswer", answer);

      $hit.empty();
      $hit.append($input);

      // create hint ? button
      const $hint = $("<viewhint>");
      $hint.text("?");
      $hit.append($hint);

      numExercises--;
    }

    const $Body = $("body");

    $Body.on("change", "select.viewinput", view.activityHelper.inputHandler);
    $Body.on("click", "viewhint", view.activityHelper.hintHandler);
  },

  /**
   * Gets the options provided by the server in the distractors attribute.
   */
  getOptions: function($hit, capType) {
    const options = [];
    let j = 0;

    const distractors = $hit.data("distractors").split(";");

    if (view.language === "ru") {
      // Add the distractor forms to the options list:
      while (j < distractors.length && options.length < 4) {
        // The forms that are homonymous to the correct form are excluded from the list of options:
        if (distractors[j].toLowerCase() != $hit.data("correctform").toLowerCase() && distractors[j] != "") {
          options.push(view.lib.matchCapitalization(distractors[j], capType));
        }
        j++;
      }
      options.push(view.lib.matchCapitalization($hit.data("correctform"), capType));
    }
    else {
      // Add the distractor forms to the options list:
      while (j < distractors.length && options.length < 4) {
        if (distractors[j].toLowerCase() != $hit.text().toLowerCase() && distractors[j] != "") {
          options.push(view.lib.matchCapitalization(distractors[j], capType));
        }
        j++;
      }
      options.push(view.lib.matchCapitalization($hit.text(), capType));
    }
    
    view.lib.shuffleList(options);

    return options;
  }
};