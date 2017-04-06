/**
 * Tests for the enhancement.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

describe("enhancer.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
    fixture.cleanup();
    view.activity = "";
    view.showInst = false;
    view.topics = {};
    view.topic = "";
    view.language = "";
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors for this module", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems
      fixture.load("/fixtures/ru-no-markup.html");

      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div id='wertiview-content'>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      expect($("#wertiview-content").length).to.be.above(0);
      expect($("#ru-no-markup-body").length).to.be.above(0);
    });
  });

  describe("init", function() {
    it("should call restoreToOriginal(), as there is still server markup in the page", function() {
      const restoreToOriginalSpy = sandbox.spy(view.enhancer, "restoreToOriginal");

      $("body").append("<viewenhancement>");

      view.enhancer.enhance();

      sinon.assert.calledOnce(restoreToOriginalSpy);

      $("viewenhancement").remove();
    });

    it("should call blur.add(), as the activity is 'cloze'", function() {
      const addSpy = sandbox.spy(view.blur, "add");

      view.activity = "cloze";

      view.enhancer.enhance();

      sinon.assert.calledOnce(addSpy);
    });

    it("should call constructInstruction(), as showInst is enabled", function() {
      const constructInstructionSpy = sandbox.spy(view.enhancer, "constructInstruction");
      const jsonData = fixture.load("fixtures/json/nouns.json", true);

      view.showInst = true;
      view.topic = "nouns";
      view.language = "ru";
      view.activity = "color";
      view.topics = {nouns: jsonData};

      view.enhancer.enhance();

      sinon.assert.calledOnce(constructInstructionSpy);
    });

    it("should call requestToToggleElement(msg, selector)", function() {
      const requestToToggleElementSpy = sandbox.spy(view.enhancer, "requestToToggleElement");

      view.enhancer.enhance();

      sinon.assert.calledOnce(requestToToggleElementSpy);
      sinon.assert.calledWithExactly(requestToToggleElementSpy,
        "show element",
        "#wertiview-toolbar-abort-button"
      );
    });

    it("should call createActivityData()", function() {
      const createActivityDataSpy = sandbox.spy(view.enhancer, "createActivityData");

      view.enhancer.enhance();

      sinon.assert.calledOnce(createActivityDataSpy);
    });
  });
});
