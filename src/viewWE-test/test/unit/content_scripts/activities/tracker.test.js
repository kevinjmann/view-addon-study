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
    fixture.load("/viewWE-test/fixtures/ru-nouns-mc-and-cloze.html");
    unitTest.setViewDefaults();
    view.userid = "some-id";
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
    it("should not do anything if the user is logged out", function() {
      const detectCapitalizationSpy = sandbox.spy(view.lib, "detectCapitalization");

      const $EnhancementElement = $("[data-type='hit']").first();
      const submission = "Усвоением";
      const isCorrect = false;
      const usedSolution = false;

      view.userid = "";

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedSolution
      );

      sinon.assert.notCalled(detectCapitalizationSpy);
    });

    it("should call extractRawSentenceWithMarkedElement(enhancementSelector)", function() {
      const extractRawSentenceWithMarkedElementSpy = sandbox.spy(
        view.tracker, "extractRawSentenceWithMarkedElement");

      const $EnhancementElement = $("[data-type='hit']").first();
      const submission = "Усвоением";
      const isCorrect = false;
      const usedSolution = false;

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedSolution
      );

      sinon.assert.calledOnce(extractRawSentenceWithMarkedElementSpy);
      sinon.assert.calledWithExactly(extractRawSentenceWithMarkedElementSpy,
        $EnhancementElement
      );
    });

    it("should return the raw sentence with marked element", function() {
      const $EnhancementElement = $("#VIEW-N-Msc-Anim-Pl-Ins-3");

      view.cloze.createExercise($EnhancementElement);

      const extractRawSentenceWithMarkedElementSpy = sandbox.spy(
        view.tracker, "extractRawSentenceWithMarkedElement");

      view.tracker.extractRawSentenceWithMarkedElement($EnhancementElement);

      expect(extractRawSentenceWithMarkedElementSpy.firstCall.returnValue)
      .to.equal("Усвое́ние языка процесс обучения человека языку, исследуемый " +
        "<viewenhancement>лингвистами</viewenhancement>.")
    });

    it("should call detectCapitalization(word)", function() {
      const $EnhancementElement = $("[data-type='hit']").first();
      const submission = "Усвоением";
      const isCorrect = false;
      const usedSolution = false;

      view.cloze.createExercise($EnhancementElement);

      const detectCapitalizationSpy = sandbox.spy(view.lib, "detectCapitalization");

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedSolution
      );

      sinon.assert.calledOnce(detectCapitalizationSpy);
      sinon.assert.calledWithExactly(detectCapitalizationSpy, $EnhancementElement.data("original-text"));
    });

    it("should call getCorrectAnswer($EnhancementElement, capType)", function() {
      const getCorrectAnswerSpy = sandbox.spy(view.activityHelper, "getCorrectAnswer");

      const $EnhancementElement = $("[data-type='hit']").first();
      const submission = "Усвоением";
      const isCorrect = false;
      const usedSolution = false;
      const capType = 2;

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedSolution
      );

      sinon.assert.calledOnce(getCorrectAnswerSpy);
      sinon.assert.calledWithExactly(getCorrectAnswerSpy, $EnhancementElement, capType);
    });

    it("should call requestToSendTrackingData(trackingData), 'mc' activity", function() {
      const requestToSendTrackingDataSpy = sandbox.spy(view.tracker, "requestToSendTrackingData");

      const $EnhancementElement = $("[data-type='hit']").first();

      const token = "some token";
      const taskId = "fake-task-id";
      const enhancementId = $EnhancementElement.attr("id");
      const submission = "Усвоением";
      const sentence = "<viewenhancement>Усвое́ние</viewenhancement> языка процесс " +
        "обучения человека языку, исследуемый лингвистами.";
      const isCorrect = false;
      const timestamp = 99;
      const correctAnswer = "Усвоение";
      const usedSolution = false;

      const trackingData = {};

      trackingData["token"] = token;
      trackingData["task-id"] = taskId;
      trackingData["enhancement-id"] = enhancementId;
      trackingData["submission"] = submission;
      trackingData["sentence"] = sentence;
      trackingData["is-correct"] = isCorrect;
      trackingData["correct-answer"] = correctAnswer;
      trackingData["used-solution"] = usedSolution;
      trackingData["timestamp"] = timestamp;

      view.token = token;
      view.taskId = taskId;
      view.timestamp = timestamp;

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedSolution
      );

      sinon.assert.calledOnce(requestToSendTrackingDataSpy);
      sinon.assert.calledWithExactly(requestToSendTrackingDataSpy, trackingData);
    });

    it("should call requestToSendTrackingData(trackingData), 'click' activity", function() {
      const requestToSendTrackingDataSpy = sandbox.spy(view.tracker, "requestToSendTrackingData");

      const $EnhancementElement = $("[data-type='hit']").first();
      const token = "some token";
      const taskId = "fake-task-id";
      const enhancementId = $EnhancementElement.attr("id");
      const submission = "Усвоением";
      const sentence = "<viewenhancement>Усвое́ние</viewenhancement> языка процесс " +
        "обучения человека языку, исследуемый лингвистами.";
      const correctAnswer = "Усвоение";
      const isCorrect = false;
      const timestamp = 99;
      const usedSolution = false;

      const trackingData = {};

      trackingData["token"] = token;
      trackingData["task-id"] = taskId;
      trackingData["enhancement-id"] = enhancementId;
      trackingData["submission"] = submission;
      trackingData["sentence"] = sentence;
      trackingData["is-correct"] = isCorrect;
      trackingData["timestamp"] = timestamp;
      trackingData["correct-answer"] = correctAnswer;
      trackingData["used-solution"] = usedSolution;

      view.token = token;
      view.taskId = taskId;
      view.timestamp = timestamp;

      view.tracker.trackData(
        $EnhancementElement,
        submission,
        isCorrect,
        usedSolution
      );

      sinon.assert.calledOnce(requestToSendTrackingDataSpy);
      sinon.assert.calledWithExactly(requestToSendTrackingDataSpy, trackingData);
    });

    it("should send a request to send tracking data to the server", function() {
      const trackingData = {data: "some data"};

      view.tracker.requestToSendTrackingData(trackingData);

      sinon.assert.calledOnce(chrome.runtime.sendMessage);
      sinon.assert.calledWithExactly(chrome.runtime.sendMessage, {
        action: "sendTrackingData",
        trackingData: trackingData,
        serverTrackingURL: "https://view.aleks.bg/act/tracking"
      });
    });
  });
});
