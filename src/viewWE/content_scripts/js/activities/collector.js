view.collector = {
  /**
   * Collects data from the user-interaction with the activity and sends
   * it to the server for tracking.
   *
   * @param {object} $EnhancementElement the current enhancement element the
   * user is interacting with
   * @param {string} input the input obtained from the user action
   * @param {boolean} countsAsCorrect true if the answer is correct,
   * false otherwise
   * @param usedHint true if a hint was used, false otherwise
   */
  collectAndSendData: function($EnhancementElement, input, countsAsCorrect, usedHint) {
    const interactionData = {};
    const elementData = {};

    interactionData["url"] = document.baseURI;
    interactionData["language"] = view.language;
    interactionData["topic"] = view.topic;
    interactionData["activity"] = view.activity;

    const isClick = (interactionData["activity"] === "click");
    elementData["viewenhancementid"] = $EnhancementElement.attr("id");
    elementData["userinput"] = input;

    if (!isClick) {
      const capType = view.lib.detectCapitalization($EnhancementElement.text().trim());
      elementData["correctanswer"] = view.activityHelper.getCorrectAnswer($EnhancementElement, capType);
      elementData["usedhint"] = usedHint;
    }

    elementData["countsascorrect"] = countsAsCorrect;
    interactionData["element"] = JSON.stringify(elementData);

    view.collector.requestToSendInteractionData(interactionData);
  },

  /**
   * Send a request to the background script to send interaction data
   * to the server.
   *
   * @param {object} interactionData the data to be sent
   */
  requestToSendInteractionData: function(interactionData) {
    chrome.runtime.sendMessage({
      msg: "send interactionData",
      interactionData: interactionData,
      servletURL: view.servletURL
    });
  }
};