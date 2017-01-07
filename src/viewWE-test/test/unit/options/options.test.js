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
    fixture.load("/fixtures/options.html");
  });

  afterEach(function() {
    sandbox.restore();
    viewOptions.$cache = new Selector_Cache();
    fixture.cleanup();
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors in the viewOptions", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems

      expect($(viewOptions.selectorStart + "fixed-number-of-exercises").val()).to.equal("0");
      expect($(viewOptions.selectorStart + "fixed-number-of-exercises-value").val()).to.equal("25");

      expect($(viewOptions.selectorStart + "percentage-of-exercises").val()).to.equal("1");
      expect($(viewOptions.selectorStart + "percentage-of-exercises-value").val()).to.equal("100");

      expect($(viewOptions.selectorStart + "random").val()).to.equal("0");

      expect($(viewOptions.selectorStart + "first-offset").val()).to.equal("1");
      expect($(viewOptions.selectorStart + "first-offset-value").val()).to.equal("0");

      expect($(viewOptions.selectorStart + "interval-size").val()).to.equal("2");
      expect($(viewOptions.selectorStart + "interval-size-value").val()).to.equal("1");

      expect($(viewOptions.selectorStart + "show-instructions")).to.exist;

      expect($(viewOptions.selectorStart + "save-options")).to.exist;

      expect($(viewOptions.selectorStart + "options-saved")).to.exist;
    });
  });

  describe("document ready", function() {
    it("should call init() when the document is ready", function(done) {
      const initSpy = sandbox.spy(viewOptions, "init");

      $(document).ready(function() {
        sinon.assert.calledOnce(initSpy);
        done();
      });
    });
  });

  describe("init", function() {
    it("should initialize all handlers and restore previous user options", function() {
      const initFixedNumberHandlerSpy = sandbox.spy(viewOptions, "initFixedNumberHandler");
      const initPercentageHandlerSpy = sandbox.spy(viewOptions, "initPercentageHandler");
      const initRandomChoiceHandlerSpy = sandbox.spy(viewOptions, "initRandomChoiceHandler");
      const initFirstOffsetChoiceHandlerSpy = sandbox.spy(viewOptions, "initFirstOffsetChoiceHandler");
      const initIntervalSizeChoiceHandlerSpy = sandbox.spy(viewOptions, "initIntervalSizeChoiceHandler");
      const initSaveOptionsHandlerSpy = sandbox.spy(viewOptions, "initSaveOptionsHandler");
      const restoreUserOptionsSpy = sandbox.spy(viewOptions, "restoreUserOptions");
      
      viewOptions.init();

      sinon.assert.calledOnce(initFixedNumberHandlerSpy);
      sinon.assert.calledOnce(initPercentageHandlerSpy);
      sinon.assert.calledOnce(initRandomChoiceHandlerSpy);
      sinon.assert.calledOnce(initFirstOffsetChoiceHandlerSpy);
      sinon.assert.calledOnce(initIntervalSizeChoiceHandlerSpy);
      sinon.assert.calledOnce(initSaveOptionsHandlerSpy);
      sinon.assert.calledOnce(restoreUserOptionsSpy);
    });
  });

});
