/**
 * Tests for the collector.js file of the VIEW add-on.
 *
 * Created by eduard on 24.01.17.
 */

"use strict";

describe("collector.js", function() {
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

  describe("collectAndSendData", function() {
    it("should call detectCapitalization($EnhancementElement.text()), as the activity is not 'click'", function() {
      const detectCapitalizationSpy = sandbox.spy(view.lib, "detectCapitalization");

      const $EnhancementElement = $("[data-type='hit']").first();
      const input = "Усвоением";
      const countAsCorrect = false;
      const usedHint = false;

      view.activity = "mc";

      view.collector.collectAndSendData(
        $EnhancementElement,
        input,
        countAsCorrect,
        usedHint
      );

      sinon.assert.calledOnce(detectCapitalizationSpy);
      sinon.assert.calledWithExactly(detectCapitalizationSpy, $EnhancementElement.text());
    });

    it("should call getCorrectAnswer($EnhancementElement, capType), as the activity is not 'click'", function() {
      const getCorrectAnswerSpy = sandbox.spy(view.activityHelper, "getCorrectAnswer");

      const $EnhancementElement = $("[data-type='hit']").first();
      const input = "Усвоением";
      const countAsCorrect = false;
      const usedHint = false;
      const capType = 2;

      view.activity = "mc";

      view.collector.collectAndSendData(
        $EnhancementElement,
        input,
        countAsCorrect,
        usedHint
      );

      sinon.assert.calledOnce(getCorrectAnswerSpy);
      sinon.assert.calledWithExactly(getCorrectAnswerSpy, $EnhancementElement, capType);
    });

    it("should call requestToSendInteractionData(interactionData), 'mc' activity", function() {
      const requestToSendInteractionDataSpy = sandbox.spy(view.collector, "requestToSendInteractionData");

      const $EnhancementElement = $("[data-type='hit']").first();
      const input = "Усвоением";
      const countsAsCorrect = false;
      const usedHint = false;

      const language = "ru";
      const topic = "nouns";
      const activity = "mc";


      const elementData = {
        viewenhancementid: $EnhancementElement.attr("id"),
        userinput: input,
        correctanswer: "Усвоение",
        usedhint: usedHint,
        countsascorrect: countsAsCorrect
      };

      const interactionData = {
        url: document.baseURI,
        language: language,
        topic: topic,
        activity: activity,
        element: JSON.stringify(elementData)
      };

      view.language = language;
      view.topic = topic;
      view.activity = activity;

      view.collector.collectAndSendData(
        $EnhancementElement,
        input,
        countsAsCorrect,
        usedHint
      );

      sinon.assert.calledOnce(requestToSendInteractionDataSpy);
      sinon.assert.calledWithExactly(requestToSendInteractionDataSpy, interactionData);
    });

    it("should call requestToSendInteractionData(interactionData), 'click' activity", function() {
      const requestToSendInteractionDataSpy = sandbox.spy(view.collector, "requestToSendInteractionData");

      const $EnhancementElement = $("[data-type='hit']").first();
      const input = "Усвоением";
      const countsAsCorrect = false;
      const usedHint = false;

      const language = "ru";
      const topic = "nouns";
      const activity = "click";


      const elementData = {
        viewenhancementid: $EnhancementElement.attr("id"),
        userinput: input,
        countsascorrect: countsAsCorrect
      };

      const interactionData = {
        url: document.baseURI,
        language: language,
        topic: topic,
        activity: activity,
        element: JSON.stringify(elementData)
      };

      view.language = language;
      view.topic = topic;
      view.activity = activity;

      view.collector.collectAndSendData(
        $EnhancementElement,
        input,
        countsAsCorrect,
        usedHint
      );

      sinon.assert.calledOnce(requestToSendInteractionDataSpy);
      sinon.assert.calledWithExactly(requestToSendInteractionDataSpy, interactionData);
    });

    it("should send a request to send interaction data to the server", function() {
      const interactionData = {data: "some data"};

      view.collector.requestToSendInteractionData(interactionData);

      sinon.assert.calledOnce(chrome.runtime.sendMessage);
      sinon.assert.calledWithExactly(chrome.runtime.sendMessage, {
        msg: "send interactionData",
        interactionData: interactionData,
        servletURL: "https://view.aleks.bg/view"
      });
    });
  });
});