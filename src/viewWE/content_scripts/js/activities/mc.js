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

    view.mc.handler(hitList,
      view.mc.inputHandler,
      view.mc.hintHandler,
      view.mc.getOptions,
      view.mc.getCorrectAnswer);
  },

  /**
   * Generate multiple choice exercises.
   *
   * @param hitList list of hits that could be turned into exercises,
   * unwanted instance must be removed in advance
   */
  handler: function(hitList) {
    console.log("mcHandler(hitList)");

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
      
      const answer = view.mc.getCorrectAnswer($hit);


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

    $("body").on("change", "select.viewinput", view.mc.inputHandler);
    $("body").on("click", "viewhint", view.mc.hintHandler);
  },

  /**
   * Deals with the input in the mc and cloze activities.
   */
  inputHandler: function() {
    let countsAsCorrect = false;
    const element = this;
    const inputId = $(".viewinput").index(this);
    const clueid = $(element).data("clueid");

    const userid = view.userid;
    let infos = {};

    if (userid) {	// if the user is logged in (userid is not null)
      // collect info data before page update
      infos = view.interaction.collectInfoData(
        element,
        false, // usedHint: only true when hint handler
        view.interaction.collectInputData,
        view.interaction.collectAnswerData);
    }

    // if the answer is correct, turn into text, else color text within input
    if ($(element).val().toLowerCase() == $(element).data("viewanswer").toLowerCase()) {
      countsAsCorrect = true;
      // return the clue tag color to what it was originally
      $("#" + clueid).css("color", "inherit");
      const $text = $("<viewenhancement>");
      $text.addClass("clozeStyleCorrect");
      $text.text($(element).data("viewanswer"));
      // save the original text in a hidden field
      $text.data("vieworiginaltext", $(element).data("vieworiginaltext"));

      view.lib.replaceInput($(element).parent(), $text);

      view.lib.jumpTo(inputId);

    } else {
      // give the clue tag a color if the student guessed wrong
      $("#" + clueid).css("color", "red");
      // turns all options, the topmost element after selection included, as red
      $(element).addClass("clozeStyleIncorrect");
      // remove assigned classes to all options from previous selections
      $(element).find("option").removeAttr("class");
      // turn the selected option red
      $(element).find("option:selected").addClass("clozeStyleIncorrect");
      // turn the not selected options black
      $(element).find("option:not(:selected)").addClass("clozeStyleNeutral");
    }

    if (userid) {	// if the user is logged in (userid is not null)
      const info = infos.info;
      const elementInfo = infos.elementInfo;

      // collect and send interaction data after page update
      view.interaction.collectInteractionData(
        info,
        elementInfo,
        countsAsCorrect,
        false); // usedHint: only true when hint handler
    }

    // prevent execution of further event listeners
    return false;
  },

  /**
   * Deals with the hint in the mc and cloze activities.
   */
  hintHandler: function() {
    const element = this;
    const inputId = $(".viewinput").index($(element).prev());
    const clueid = $(element).data("clueid");

    const userid = view.userid;
    let infos = {};

    if (userid) {	// if the user is logged in (userid is not null)
      // collect info data before page update
      infos = view.interaction.collectInfoData(
        element,
        true, // usedHint: only true when hint handler
        view.interaction.collectInputData,
        view.interaction.collectAnswerData);
    }

    // return the clue tag color to what it was originally
    $("#" + clueid).css("color", "inherit");

    // fill in the answer by replacing input with text
    const $text = $("<viewenhancement>");
    $text.addClass("clozeStyleProvided");
    $text.text($(element).prev().data("viewanswer"));
    // save the original text in a hidden field
    $text.data("vieworiginaltext", $(element).prev().data("vieworiginaltext"));

    view.lib.replaceInput($(element).parent(), $text);

    view.lib.jumpTo(inputId);

    if (userid) {	// if the user is logged in (userid is not null)
      const info = infos.info;
      const elementInfo = infos.elementInfo;

      // collect and send interaction data after page update
      view.interaction.collectInteractionData(
        info,
        elementInfo,
        true, // if the user used a hint, then it is definitely a correct answer
        true); // usedHint: only true when hint handler
    }

    // prevent execution of further event listeners
    return false;
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
   * Get the correct answer for the mc and cloze activities.
   */
  getCorrectAnswer: function($hit) {
    if (view.language === "ru") {
      return $hit.data("correctform");
    }
    else{
      return $hit.text().trim();
    }
  }
};