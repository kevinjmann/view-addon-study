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
    chrome.storage.local.set.reset();
    chrome.storage.local.get.reset();
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

    describe("initFixedNumberHandler", function() {
      it("should initialize the handler for fixed number of exercises", function() {
        const selectorSpy = sandbox.spy(viewOptions.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        viewOptions.initFixedNumberHandler();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, viewOptions.selectorStart + "fixed-number-of-exercises");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      it("should call chooseFixedNumber() on change", function() {
        const chooseFixedNumberSpy = sandbox.spy(viewOptions, "chooseFixedNumber");

        viewOptions.initFixedNumberHandler();

        $(viewOptions.selectorStart + "fixed-number-of-exercises").trigger("change");

        sinon.assert.calledOnce(chooseFixedNumberSpy);
      });

      it("should show fixed number value and hide percentage value", function() {
        viewOptions.chooseFixedNumber();

        expect($(viewOptions.selectorStart + "fixed-number-of-exercises-value").is(":visible")).to.be.true;
        expect($(viewOptions.selectorStart + "percentage-of-exercises-value").is(":hidden")).to.be.true;
      });
    });

    describe("initPercentageHandler", function() {
      it("should initialize the handler for percentage of exercises", function() {
        const selectorSpy = sandbox.spy(viewOptions.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        viewOptions.initPercentageHandler();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, viewOptions.selectorStart + "percentage-of-exercises");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      it("should call choosePercentage() on change", function() {
        const choosePercentageSpy = sandbox.spy(viewOptions, "choosePercentage");

        viewOptions.initPercentageHandler();

        $(viewOptions.selectorStart + "percentage-of-exercises").trigger("change");

        sinon.assert.calledOnce(choosePercentageSpy);
      });

      it("should show percentage value and hide fixed number value", function() {
        viewOptions.choosePercentage();

        expect($(viewOptions.selectorStart + "percentage-of-exercises-value").is(":visible")).to.be.true;
        expect($(viewOptions.selectorStart + "fixed-number-of-exercises-value").is(":hidden")).to.be.true;
      });
    });

    describe("initRandomChoiceHandler", function() {
      it("should initialize the handler for random choice of exercises", function() {
        const selectorSpy = sandbox.spy(viewOptions.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        viewOptions.initRandomChoiceHandler();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, viewOptions.selectorStart + "random");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      it("should call chooseRandom() on change", function() {
        const chooseRandomSpy = sandbox.spy(viewOptions, "chooseRandom");

        viewOptions.initRandomChoiceHandler();

        $(viewOptions.selectorStart + "random").trigger("change");

        sinon.assert.calledOnce(chooseRandomSpy);
      });

      it("should hide first offset value and interval size value", function() {
        viewOptions.chooseRandom();

        expect($(viewOptions.selectorStart + "first-offset-value").is(":hidden")).to.be.true;
        expect($(viewOptions.selectorStart + "interval-size-value").is(":hidden")).to.be.true;
      });
    });

    describe("initFirstOffsetChoiceHandler", function() {
      it("should initialize the handler for first offset choice of exercises", function() {
        const selectorSpy = sandbox.spy(viewOptions.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        viewOptions.initFirstOffsetChoiceHandler();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, viewOptions.selectorStart + "first-offset");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      it("should call chooseFirstOffset() on change", function() {
        const chooseFirstOffsetSpy = sandbox.spy(viewOptions, "chooseFirstOffset");

        viewOptions.initFirstOffsetChoiceHandler();

        $(viewOptions.selectorStart + "first-offset").trigger("change");

        sinon.assert.calledOnce(chooseFirstOffsetSpy);
      });

      it("should show first offset value and hide interval size value", function() {
        viewOptions.chooseFirstOffset();

        expect($(viewOptions.selectorStart + "first-offset-value").is(":visible")).to.be.true;
        expect($(viewOptions.selectorStart + "interval-size-value").is(":hidden")).to.be.true;
      });
    });

    describe("initIntervalSizeChoiceHandler", function() {
      it("should initialize the handler for interval size choice of exercises", function() {
        const selectorSpy = sandbox.spy(viewOptions.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        viewOptions.initIntervalSizeChoiceHandler();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, viewOptions.selectorStart + "interval-size");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "change");
      });

      it("should call chooseIntervalSize() on change", function() {
        const chooseIntervalSizeSpy = sandbox.spy(viewOptions, "chooseIntervalSize");

        viewOptions.initIntervalSizeChoiceHandler();

        $(viewOptions.selectorStart + "interval-size").trigger("change");

        sinon.assert.calledOnce(chooseIntervalSizeSpy);
      });

      it("should show interval size value and hide first offset value", function() {
        viewOptions.chooseIntervalSize();

        expect($(viewOptions.selectorStart + "interval-size-value").is(":visible")).to.be.true;
        expect($(viewOptions.selectorStart + "first-offset-value").is(":hidden")).to.be.true;
      });
    });

    describe("initSaveOptionsHandler", function() {
      it("should initialize the handler for saving the options", function() {
        const selectorSpy = sandbox.spy(viewOptions.$cache, "get");
        const eventSpy = sandbox.spy($.fn, "on");

        viewOptions.initSaveOptionsHandler();

        sinon.assert.calledOnce(selectorSpy);
        sinon.assert.calledWithExactly(selectorSpy, viewOptions.selectorStart + "save-options");

        sinon.assert.calledOnce(eventSpy);
        sinon.assert.calledWith(eventSpy, "click");
      });

      it("should call saveUserOptions() on click", function() {
        const saveUserOptionsSpy = sandbox.spy(viewOptions, "saveUserOptions");

        viewOptions.initSaveOptionsHandler();

        $(viewOptions.selectorStart + "save-options").trigger("click");

        sinon.assert.calledOnce(saveUserOptionsSpy);
      });

      it("should set all user options and then call showSavedMessage()", function() {
        const showSavedMessageSpy = sandbox.spy(viewOptions, "showSavedMessage");

        const fixedOrPercentage = 0;
        const fixedNumberOfExercises = 30;
        const percentageOfExercises = 90;
        const choiceMode = 1;
        const firstOffset = 5;
        const intervalSize = 1;
        const showInst = false;

        chrome.storage.local.set.yields(); // make set synchronous

        $(viewOptions.selectorStart + "fixed-number-of-exercises").prop("checked", true);
        $(viewOptions.selectorStart + "fixed-number-of-exercises-value").val(fixedNumberOfExercises);
        $(viewOptions.selectorStart + "percentage-of-exercises-value").val(percentageOfExercises);
        $(viewOptions.selectorStart + "first-offset").prop("checked", true);
        $(viewOptions.selectorStart + "first-offset-value").val(firstOffset);
        $(viewOptions.selectorStart + "interval-size-value").val(intervalSize);
        $(viewOptions.selectorStart + "show-instructions").prop("checked", showInst);

        viewOptions.saveUserOptions();

        sinon.assert.calledOnce(chrome.storage.local.set);
        sinon.assert.calledWith(chrome.storage.local.set, {
          fixedOrPercentage,
          fixedNumberOfExercises,
          percentageOfExercises,
          choiceMode,
          firstOffset,
          intervalSize,
          showInst
        });

        sinon.assert.calledOnce(showSavedMessageSpy);
      });

      it("should show the options saved message for 5 seconds and then fade out", function() {
        const delaySpy = sandbox.spy($.fn, "delay");
        sandbox.useFakeTimers();

        expect($(viewOptions.selectorStart + "options-saved").css("display")).to.equal("none");

        viewOptions.showSavedMessage();

        expect($(viewOptions.selectorStart + "options-saved").css("display")).to.equal("block");
        expect($(viewOptions.selectorStart + "options-saved").attr("style")).to.not.contain("opacity: 1");

        sinon.assert.calledOnce(delaySpy);
        sinon.assert.calledWithExactly(delaySpy, 5000);

        sandbox.clock.tick(5000);

        expect($(viewOptions.selectorStart + "options-saved").attr("style")).to.contain("opacity: 1");
      });
    });
    describe("restoreUserOptions", function() {
      it("should call all restoration functions with default values", function() {
        const chooseHowManyExercisesSpy = sandbox.spy(viewOptions, "chooseHowManyExercises");
        const restoreHowManyExercisesSpy = sandbox.spy(viewOptions, "restoreHowManyExercises");
        const chooseHowToChooseExercisesSpy = sandbox.spy(viewOptions, "chooseHowToChooseExercises");
        const restoreHowToChooseExercisesSpy = sandbox.spy(viewOptions, "restoreHowToChooseExercises");
        const restoreIfToShowInstructionsSpy = sandbox.spy(viewOptions, "restoreIfToShowInstructions");

        const fixedOrPercentage = 0;
        const fixedNumberOfExercises = 25;
        const percentageOfExercises = 100;
        const choiceMode = 0;
        const firstOffset = 0;
        const intervalSize = 1;
        const showInst = false;

        chrome.storage.local.get.yields({});

        viewOptions.restoreUserOptions();

        sinon.assert.calledOnce(chooseHowManyExercisesSpy);
        sinon.assert.calledWithExactly(chooseHowManyExercisesSpy, fixedOrPercentage);

        sinon.assert.calledOnce(restoreHowManyExercisesSpy);
        sinon.assert.calledWithExactly(restoreHowManyExercisesSpy,
          fixedNumberOfExercises,
          percentageOfExercises
        );

        sinon.assert.calledOnce(chooseHowToChooseExercisesSpy);
        sinon.assert.calledWithExactly(chooseHowToChooseExercisesSpy, choiceMode);

        sinon.assert.calledOnce(restoreHowToChooseExercisesSpy);
        sinon.assert.calledWithExactly(restoreHowToChooseExercisesSpy,
          firstOffset,
          intervalSize
        );

        sinon.assert.calledOnce(restoreIfToShowInstructionsSpy);
        sinon.assert.calledWithExactly(restoreIfToShowInstructionsSpy, showInst);
      });

      it("should call all restoration functions with stored values", function() {
        const chooseHowManyExercisesSpy = sandbox.spy(viewOptions, "chooseHowManyExercises");
        const restoreHowManyExercisesSpy = sandbox.spy(viewOptions, "restoreHowManyExercises");
        const chooseHowToChooseExercisesSpy = sandbox.spy(viewOptions, "chooseHowToChooseExercises");
        const restoreHowToChooseExercisesSpy = sandbox.spy(viewOptions, "restoreHowToChooseExercises");
        const restoreIfToShowInstructionsSpy = sandbox.spy(viewOptions, "restoreIfToShowInstructions");

        const fixedOrPercentage = 1;
        const fixedNumberOfExercises = 30;
        const percentageOfExercises = 90;
        const choiceMode = 1;
        const firstOffset = 5;
        const intervalSize = 3;
        const showInst = true;

        chrome.storage.local.get.yields({
          fixedOrPercentage,
          fixedNumberOfExercises,
          percentageOfExercises,
          choiceMode,
          firstOffset,
          intervalSize,
          showInst
        });

        viewOptions.restoreUserOptions();

        sinon.assert.calledOnce(chooseHowManyExercisesSpy);
        sinon.assert.calledWithExactly(chooseHowManyExercisesSpy, fixedOrPercentage);

        sinon.assert.calledOnce(restoreHowManyExercisesSpy);
        sinon.assert.calledWithExactly(restoreHowManyExercisesSpy,
          fixedNumberOfExercises,
          percentageOfExercises
        );

        sinon.assert.calledOnce(chooseHowToChooseExercisesSpy);
        sinon.assert.calledWithExactly(chooseHowToChooseExercisesSpy, choiceMode);

        sinon.assert.calledOnce(restoreHowToChooseExercisesSpy);
        sinon.assert.calledWithExactly(restoreHowToChooseExercisesSpy,
          firstOffset,
          intervalSize
        );

        sinon.assert.calledOnce(restoreIfToShowInstructionsSpy);
        sinon.assert.calledWithExactly(restoreIfToShowInstructionsSpy, showInst);
      });
    });

    describe("chooseHowManyExercises", function() {
      it("should check fixed number of exercises and call chooseFixedNumber(), as the argument is 0", function() {
        const chooseFixedNumberSpy = sandbox.spy(viewOptions, "chooseFixedNumber");

        viewOptions.chooseHowManyExercises(0);

        expect($(viewOptions.selectorStart + "fixed-number-of-exercises").prop("checked")).to.be.true;

        sinon.assert.calledOnce(chooseFixedNumberSpy);
      });

      it("should check percentage of exercises and call choosePercentage(), as the argument is 1", function() {
        const choosePercentageSpy = sandbox.spy(viewOptions, "choosePercentage");

        viewOptions.chooseHowManyExercises(1);

        expect($(viewOptions.selectorStart + "percentage-of-exercises").prop("checked")).to.be.true;

        sinon.assert.calledOnce(choosePercentageSpy);
      });
    });

    describe("restoreHowManyExercises", function() {
      it("should restore the values of the fixed number and percentage of exercises", function() {
        const fixedNumberOfExercises = 25;
        const percentageOfExercises = 100;

        viewOptions.restoreHowManyExercises(
          fixedNumberOfExercises,
          percentageOfExercises
        );

        expect($(viewOptions.selectorStart + "fixed-number-of-exercises-value").val()).to.equal(fixedNumberOfExercises+"");
        expect($(viewOptions.selectorStart + "percentage-of-exercises-value").val()).to.equal(percentageOfExercises+"");
      });
    });

    describe("chooseHowToChooseExercises", function() {
      it("should check random choice and call chooseRandom(), as the argument is 0", function() {
        const chooseRandomSpy = sandbox.spy(viewOptions, "chooseRandom");

        viewOptions.chooseHowToChooseExercises(0);

        expect($(viewOptions.selectorStart + "random").prop("checked")).to.be.true;

        sinon.assert.calledOnce(chooseRandomSpy);
      });

      it("should check first offset and call chooseFirstOffset(), as the argument is 1", function() {
        const chooseFirstOffsetSpy = sandbox.spy(viewOptions, "chooseFirstOffset");

        viewOptions.chooseHowToChooseExercises(1);

        expect($(viewOptions.selectorStart + "first-offset").prop("checked")).to.be.true;

        sinon.assert.calledOnce(chooseFirstOffsetSpy);
      });

      it("should check interval size and call chooseIntervalSize(), as the argument is 2", function() {
        const chooseIntervalSizeSpy = sandbox.spy(viewOptions, "chooseIntervalSize");

        viewOptions.chooseHowToChooseExercises(2);

        expect($(viewOptions.selectorStart + "interval-size").prop("checked")).to.be.true;

        sinon.assert.calledOnce(chooseIntervalSizeSpy);
      });
    });

    describe("restoreHowToChooseExercises", function() {
      it("should restore the values of how exercises should be chosen", function() {
        const firstOffset = 5;
        const intervalSize = 3;

        viewOptions.restoreHowToChooseExercises(
          firstOffset,
          intervalSize
        );

        expect($(viewOptions.selectorStart + "first-offset-value").val()).to.equal(firstOffset+"");
        expect($(viewOptions.selectorStart + "interval-size-value").val()).to.equal(intervalSize+"");
      });
    });

    describe("restoreIfToShowInstructions", function() {
      it("should restore if instructions should be shown or not", function() {
        viewOptions.restoreIfToShowInstructions(true);

        expect($(viewOptions.selectorStart + "show-instructions").prop("checked")).to.be.true;
      });
    });
  });
});
