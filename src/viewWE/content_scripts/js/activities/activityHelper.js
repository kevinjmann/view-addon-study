view.activityHelper = {
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
   * Get the correct answer for the mc and cloze activities.
   */
  getCorrectAnswer: function($hit) {
    if (view.language === "ru") {
      return $hit.data("correctform");
    }
    else{
      return $hit.text().trim();
    }
  },

  /**
   * Remove activity specific markup.
   */
  restore: function() {
    console.log("restore()");

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