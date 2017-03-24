/**
 * Tests for the click.js file of the VIEW add-on.
 *
 * Created by eduard on 20.01.17.
 */

"use strict";

describe("click.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/ru-nouns-click.html");
    view.selector.select("Sg");
  });

  afterEach(function() {
    sandbox.restore();
    fixture.cleanup();
    view.activityHelper.restore();
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
      expect($("[data-type='ambiguity']").length).to.be.above(0);
      expect($("[data-type='miss']").length).to.be.above(0);
      expect($(".selected").length).to.be.above(0);
    });
  });

  describe("run", function() {
    it("should add the click class to all viewenhancement tags and add a click handler", function() {
      const eventSpy = sandbox.spy($.fn, "on");

      const clickStyleClass = "click-style-pointer";

      const $Enhancements = $("viewenhancement");

      expect($Enhancements.hasClass(clickStyleClass)).to.be.false;

      view.click.run();

      $Enhancements.each(function() {
        expect($(this).hasClass(clickStyleClass)).to.be.true;
      });

      sinon.assert.calledOnce(eventSpy);
      sinon.assert.calledWith(eventSpy, "click");
    });

    it("should call getNumberOfExercisesAndRequestTaskId(selector)", function() {
      const getNumberOfExercisesAndRequestTaskIdSpy = sandbox.spy(
        view.activityHelper,
        "getNumberOfExercisesAndRequestTaskId"
      );
      const setNumberOfExercisesSpy = sandbox.spy(view, "setNumberOfExercises");

      const selector = "viewenhancement[data-type!='miss'].selected";

      view.click.run();

      sinon.assert.calledOnce(getNumberOfExercisesAndRequestTaskIdSpy);
      sinon.assert.calledWithExactly(getNumberOfExercisesAndRequestTaskIdSpy, selector);

      sinon.assert.calledOnce(setNumberOfExercisesSpy);
      sinon.assert.calledWithExactly(setNumberOfExercisesSpy, 20);
    });

    it("should call the handler on click", function() {
      const handlerSpy = sandbox.spy(view.click, "handler");

      const $EnhancementElement = $("[data-type='hit'].selected").first();

      view.click.run();

      $EnhancementElement.trigger("click");

      sinon.assert.calledOnce(handlerSpy);
    });

    describe("handler", function() {
      it("should add class for a correct click on an element of type 'hit'", function() {
        const $EnhancementElement = $("[data-type='hit'].selected").first();

        view.click.run();

        $EnhancementElement.trigger("click");

        expect($EnhancementElement.hasClass("click-style-correct")).to.be.true;
      });

      it("should add class for a correct click on an element of type 'ambiguity'", function() {
        const $EnhancementElement = $("[data-type='ambiguity'].selected").first();

        view.click.run();

        $EnhancementElement.trigger("click");

        expect($EnhancementElement.hasClass("click-style-correct")).to.be.true;
      });

      it("should add class for a incorrect click on an element of type 'miss'", function() {
        const $EnhancementElement = $("[data-type='miss']").first();

        view.click.run();

        $EnhancementElement.trigger("click");

        expect($EnhancementElement.hasClass("click-style-incorrect")).to.be.true;
      });

      it("should remove the click style pointer in any case", function() {
        const $EnhancementElement = $("viewenhancement").first();
        const clickStylePointer = "click-style-pointer";

        view.click.run();

        expect($EnhancementElement.hasClass(clickStylePointer)).to.be.true;

        $EnhancementElement.trigger("click");

        expect($EnhancementElement.hasClass(clickStylePointer)).to.be.false;
      });

      it("should call trackData($Enhancement,submission, isCorrect, usedHint), as the user is logged in", function() {
        const trackDataSpy = sandbox.spy(view.tracker, "trackData");

        const $EnhancementElement = $("[data-type='hit'].selected").first();
        const isCorrect = true;
        const usedHint = false;

        view.userid = "someid";

        view.click.run();

        $EnhancementElement.trigger("click");

        delete $EnhancementElement.prevObject;

        sinon.assert.calledOnce(trackDataSpy);
        sinon.assert.calledWithExactly(trackDataSpy,
          $EnhancementElement,
          $EnhancementElement.text(),
          isCorrect,
          usedHint
        );
      });

      it("should call off('click') in any case", function() {
        const eventSpy = sandbox.spy($.fn, "off");

        const $EnhancementElement = $("viewenhancement").first();

        view.click.run();

        $EnhancementElement.trigger("click");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });
    });
  });
});
