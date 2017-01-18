view.collector = {
  /**
   * Collects information available before the user interaction updates the page.
   *
   * @param {object} $Element the element the user is currently working with
   * @param usedHint true if a hint was used, false otherwise
   */
  collectInfoData: function($Element, usedHint) {
    const info = {};
    const elementInfo = {};

    info["url"] = document.baseURI;
    info["language"] = view.language;
    info["topic"] = view.topic;
    info["activity"] = view.activity;

    const isClick = (info["activity"] === "click");
    elementInfo["viewenhancementid"] = $Element.data("id");
    elementInfo["userinput"] = view.collector.collectInputData($Element, usedHint, isClick);

    if (!isClick) {
      elementInfo["correctanswer"] = view.collector.collectAnswerData($Element, usedHint);
      elementInfo["usedhint"] = usedHint;
    }

    return {
      info: info,
      elementInfo: elementInfo
    };
  },

  /**
   * Returns the input.
   *
   * @param {object} $Element the element to collect input data from
   * @param {boolean} usedHint true if a hint was used, false otherwise
   * @param {boolean} isClick true if it is the click activity, false otherwise
   * @returns {string} the text inside the element
   */
  collectInputData: function($Element, usedHint, isClick) {
    if (usedHint) {
      $Element = $Element.prev();
    }
    if (isClick) {
      return $Element.text();
    }
    else {
      if($Element.val() !== ""){
        return $Element.val();
      }
      else{
        return "no input";
      }
    }
  },

  /**
   * Returns the correct answer.
   *
   * @param {object} $Element the element to collect input data from
   * @param {boolean} usedHint true if a hint was used, false otherwise
   * @returns {string} the text inside the element
   */
  collectAnswerData: function($Element, usedHint) {
    if (usedHint) {
      $Element = $Element.prev();
    }
    return $Element.data("view-answer");
  },

  /**
   * Collects and sends information about the interaction to the server.
   *
   * @param {object} info contains all info available before user interaction
   * updates the page
   * @param {object} elementInfo contains all info of the element the user
   * interacted with
   * @param {boolean} countsAsCorrect true if the answer is correct,
   * false otherwise
   * @param {boolean} usedHint true if a hint was used, false otherwise
   */
  collectInteractionData: function(info, elementInfo, countsAsCorrect, usedHint) {
    elementInfo["countsascorrect"] = usedHint || countsAsCorrect;
    info["document"] = JSON.stringify(elementInfo);

    console.log("collectInteractionData: request 'send interactionData'");
    chrome.runtime.sendMessage({
      msg: "send interactionData",
      interactionData: info,
      servletURL: view.servletURL
    });
  }
};