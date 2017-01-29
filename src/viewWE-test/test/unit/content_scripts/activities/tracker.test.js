/**
 * Tests for the tracker.js file of the VIEW add-on.
 *
 * Created by eduard on 24.01.17.
 */

"use strict";

describe("tracker.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/ru-nouns-mc-and-cloze.html");
    view.language = "ru";
  });

  afterEach(function() {
    sandbox.restore();
    fixture.cleanup();
    chrome.runtime.sendMessage.reset();
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors for this module", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems

      expect($("viewenhancement").length).to.be.above(0);
      expect($("[data-type='hit']").length).to.be.above(0);
      expect($("[data-type='clue']").length).to.be.above(0);
    });
  });

  describe("trackData", function() {
    it("should call detectCapitalization(word), as the activity is not 'click'", function() {
      const detectCapitalizationSpy = sandbox.spy(view.lib, "detectCapitalization");

      const $EnhancementElement = $("[data-type='hit']").first();
      const submission = "Усвоением";
      const isCorrect = false;
      const usedHint = false;

      view.activity = "mc";

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedHint
      );

      sinon.assert.calledOnce(detectCapitalizationSpy);
      sinon.assert.calledWithExactly(detectCapitalizationSpy, $EnhancementElement.text());
    });

    it("should call getCorrectAnswer($EnhancementElement, capType), as the activity is not 'click'", function() {
      const getCorrectAnswerSpy = sandbox.spy(view.activityHelper, "getCorrectAnswer");

      const $EnhancementElement = $("[data-type='hit']").first();
      const submission = "Усвоением";
      const isCorrect = false;
      const usedHint = false;
      const capType = 2;

      view.activity = "mc";

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedHint
      );

      sinon.assert.calledOnce(getCorrectAnswerSpy);
      sinon.assert.calledWithExactly(getCorrectAnswerSpy, $EnhancementElement, capType);
    });

    it("should call requestToSendInteractionData(interactionData), 'mc' activity", function() {
      const requestToSendInteractionDataSpy = sandbox.spy(view.tracker, "requestToSendInteractionData");

      const $EnhancementElement = $("[data-type='hit']").first();

      const token = "some token";
      const sessionId = "fake-session-id";
      const enhancementId = $EnhancementElement.attr("id");
      const submission = "Усвоением";
      const isCorrect = false;
      const timestamp = 99;
      const correctAnswer = "Усвоение";
      const usedHint = false;

      const interactionData = {};

      interactionData["token"] = token;
      interactionData["session-id"] = sessionId;
      interactionData["enhancement-id"] = enhancementId;
      interactionData["submission"] = submission;
      interactionData["is-correct"] = isCorrect;
      interactionData["correct-answer"] = correctAnswer;
      interactionData["used-hint"] = usedHint;
      interactionData["timestamp"] = timestamp;

      view.token = token;
      view.sessionid = sessionId;
      view.timestamp = timestamp;
      view.activity = "mc";

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedHint
      );

      sinon.assert.calledOnce(requestToSendInteractionDataSpy);
      sinon.assert.calledWithExactly(requestToSendInteractionDataSpy, interactionData);
    });

    it("should call requestToSendInteractionData(interactionData), 'click' activity", function() {
      const requestToSendInteractionDataSpy = sandbox.spy(view.tracker, "requestToSendInteractionData");

      const $EnhancementElement = $("[data-type='hit']").first();
      const token = "some token";
      const sessionId = "fake-session-id";
      const enhancementId = $EnhancementElement.attr("id");
      const submission = "Усвоением";
      const isCorrect = false;
      const timestamp = 99;
      const usedHint = false;

      const interactionData = {};

      interactionData["token"] = token;
      interactionData["session-id"] = sessionId;
      interactionData["enhancement-id"] = enhancementId;
      interactionData["submission"] = submission;
      interactionData["is-correct"] = isCorrect;
      interactionData["timestamp"] = timestamp;

      view.token = token;
      view.sessionid = sessionId;
      view.timestamp = timestamp;
      view.activity = "click";

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedHint
      );

      sinon.assert.calledOnce(requestToSendInteractionDataSpy);
      sinon.assert.calledWithExactly(requestToSendInteractionDataSpy, interactionData);
    });

    it("should send a request to send interaction data to the server", function() {
      const interactionData = {data: "some data"};

      view.tracker.requestToSendInteractionData(interactionData);

      sinon.assert.calledOnce(chrome.runtime.sendMessage);
      sinon.assert.calledWithExactly(chrome.runtime.sendMessage, {
        msg: "send interactionData",
        interactionData: interactionData,
        serverTrackingURL: "https://view.aleks.bg/act/tracking"
      });
    });
  });
});
