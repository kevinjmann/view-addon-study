/**
 * Tests for the options.js file of the VIEW add-on.
 *
 * Created by eduard on 06.01.17.
 */

"use strict";

describe("options.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/ru-nouns-click.html");
  });

  afterEach(function() {
    sandbox.restore();
    fixture.cleanup();
    $("body").off("click", "viewenhancement");
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
    });
  });

  describe("run", function() {
    it("should add the click class to all viewenhancement tags and add a click handler", function() {
      const eventSpy = sandbox.spy($.fn, "on");

      const clickStyleClass = "click-style-pointer";
      const $Enhancement = $("viewenhancement");

      expect($Enhancement.hasClass(clickStyleClass)).to.be.false;

      view.click.run();

      $Enhancement.each(function() {
        expect($(this).data("view-original-text")).to.exist;
        expect($(this).hasClass(clickStyleClass)).to.be.true;
      });

      sinon.assert.calledOnce(eventSpy);
      sinon.assert.calledWith(eventSpy,
        "click",
        "viewenhancement"
      );
    });

    it("should call the handler on click", function() {
      const handlerSpy = sandbox.spy(view.click, "handler");

      const $Element = $("[data-type='hit']").first();

      view.click.run();

      $Element.trigger("click");

      sinon.assert.calledOnce(handlerSpy);
    });

    describe("handler", function() {
      it("should add class for a correct click on an element of type 'hit'", function() {
        const $Element = $("[data-type='hit']").first();

        view.click.run();

        $Element.trigger("click");

        expect($Element.hasClass("click-style-correct")).to.be.true;
      });

      it("should add class for a correct click on an element of type 'ambiguity'", function() {
        const $Element = $("[data-type='ambiguity']").first();

        view.click.run();

        $Element.trigger("click");

        expect($Element.hasClass("click-style-correct")).to.be.true;
      });

      it("should add class for a incorrect click on an element of type 'miss'", function() {
        const $Element = $("[data-type='miss']").first();

        view.click.run();

        $Element.trigger("click");

        expect($Element.hasClass("click-style-incorrect")).to.be.true;
      });

      it("should remove the click style pointer in any case", function() {
        const $Element = $("viewenhancement").first();
        const clickStylePointer = "click-style-pointer";

        view.click.run();

        expect($Element.hasClass(clickStylePointer)).to.be.true;

        $Element.trigger("click");

        expect($Element.hasClass(clickStylePointer)).to.be.false;
      });

      it("should call collectAndSendData($Enhancement, input, countsAsCorrect, usedHint), as the user is logged in", function() {
        const collectAndSendDataSpy = sandbox.spy(view.collector, "collectAndSendData");

        const $Element = $("[data-type='hit']").first();

        view.userid = "someid";

        view.click.run();

        $Element.trigger("click");

        sinon.assert.calledOnce(collectAndSendDataSpy);
        expect(collectAndSendDataSpy.firstCall.args[1]).to.equal($Element.text().trim());
        expect(collectAndSendDataSpy.firstCall.args[2]).to.be.true;
        expect(collectAndSendDataSpy.firstCall.args[3]).to.be.false;
      });

      it("should return false in any case", function() {
        const handlerSpy = sandbox.spy(view.click, "handler");

        const $Element = $("viewenhancement").first();

        view.click.run();

        $Element.trigger("click");

        sinon.assert.calledOnce(handlerSpy);
        expect(handlerSpy.firstCall.returnValue).to.be.false;
      });
    });
  });
});
