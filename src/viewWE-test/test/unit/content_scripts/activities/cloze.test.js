/**
 * Tests for the cloze.js file of the VIEW add-on.
 *
 * Created by eduard on 23.01.17.
 */

"use strict";

describe("cloze.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/ru-nouns-mc-and-cloze.html");
    view.language = "ru";
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
      expect($("[data-type='clue']").length).to.be.above(0);
    });
  });

  describe("run", function() {
    it("should create a hitlist and pass it on to the exerciseHandler", function() {
      const createHitListSpy = sandbox.spy(view.activityHelper, "createHitList");
      const exerciseHandlerSpy = sandbox.spy(view.activityHelper, "exerciseHandler");

      view.cloze.run();

      sinon.assert.calledOnce(createHitListSpy);

      sinon.assert.calledOnce(exerciseHandlerSpy);
      sinon.assert.calledWithExactly(exerciseHandlerSpy,
        createHitListSpy.firstCall.returnValue,
        view.cloze.createExercise
      );
    });

    describe("createExercise", function() {
      it("should call detectCapitalization(hitText)", function() {
        const detectCapitalizationSpy = sandbox.spy(view.lib, "detectCapitalization");

        const $hit = $("[data-type='hit']").first();
        const hitText = $hit.text().trim();

        view.cloze.createExercise($hit);

        sinon.assert.calledOnce(detectCapitalizationSpy);
        sinon.assert.calledWithExactly(detectCapitalizationSpy, hitText);

        expect(detectCapitalizationSpy.firstCall.returnValue).to.equal(2);
      });

      it("should call getCorrectAnswer($hit, capType)", function() {
        const getCorrectAnswerSpy = sandbox.spy(view.activityHelper, "getCorrectAnswer");

        const $hit = $("[data-type='hit']").first();

        view.cloze.createExercise($hit);

        sinon.assert.calledOnce(getCorrectAnswerSpy);
        sinon.assert.calledWithExactly(getCorrectAnswerSpy,
          $hit,
          2
        );

        expect(getCorrectAnswerSpy.firstCall.returnValue).to.equal("Усвоение");
      });

      it("should call createInputBox(answer, $hit)", function() {
        const createInputBoxSpy = sandbox.spy(view.cloze, "createInputBox");

        const $hit = $("[data-type='hit']").first();
        const answer = "Усвоение";

        view.cloze.createExercise($hit);

        sinon.assert.calledOnce(createInputBoxSpy);
        sinon.assert.calledWithExactly(createInputBoxSpy,
          answer,
          $hit
        );
      });

      it("should call createHint($hit)", function() {
        const createHintSpy = sandbox.spy(view.activityHelper, "createHint");

        const $hit = $("[data-type='hit']").first();

        view.cloze.createExercise($hit);

        sinon.assert.calledOnce(createHintSpy);
        sinon.assert.calledWithExactly(createHintSpy, $hit);
      });

      it("should call addBaseform($hit)", function() {
        const addBaseformSpy = sandbox.spy(view.cloze, "addBaseform");

        const $hit = $("[data-type='hit']").first();

        view.cloze.createExercise($hit);

        sinon.assert.calledOnce(addBaseformSpy);
        sinon.assert.calledWithExactly(addBaseformSpy, $hit);
      });

      describe("createInputBox", function() {
        it("should find inside the hit an input box with the class 'viewinput'", function() {
          const $hit = $("[data-type='hit']").first();
          const answer = "Усвоение";

          view.cloze.createInputBox(answer, $hit);

          const $InputBox = $hit.find(".viewinput");

          expect($InputBox.length).to.be.above(0);
        });

        it("should find inside the hit an input box with the class 'cloze-style-input'", function() {
          const $hit = $("[data-type='hit']").first();
          const answer = "Усвоение";

          view.cloze.createInputBox(answer, $hit);

          const $InputBox = $hit.find(".cloze-style-input");

          expect($InputBox.length).to.be.above(0);
        });

        it("should find in the input box the attribute 'type' with the content 'text'", function() {
          const $hit = $("[data-type='hit']").first();
          const answer = "Усвоение";

          view.cloze.createInputBox(answer, $hit);

          const $InputBox = $hit.find(".viewinput");

          expect($InputBox.attr("type")).to.equal("text");
        });

        it("should tell that the input box has a width big enough to fit the answer", function() {
          const $hit = $("[data-type='hit']").first();
          const answer = "Усвоение";

          view.cloze.createInputBox(answer, $hit);

          const $InputBox = $hit.find(".viewinput");

          expect($InputBox.css("width")).to.equal((answer.length * 10) + "px");
        });

        it("should find in the input box the data 'view-answer' with the answer as content", function() {
          const $hit = $("[data-type='hit']").first();
          const answer = "Усвоение";

          view.cloze.createInputBox(answer, $hit);

          const $InputBox = $hit.find(".viewinput");

          expect($InputBox.data("view-answer")).to.equal(answer);
        });

        it("should call empty() before append($InputBox)", function() {
          const emptySpy = sandbox.spy($.fn, "empty");
          const appendSpy = sandbox.spy($.fn, "append");

          const $hit = $("[data-type='hit']").first();
          const answer = "Усвоение";

          view.cloze.createInputBox(answer, $hit);

          sinon.assert.calledOnce(emptySpy);

          sinon.assert.calledOnce(appendSpy);

          sinon.assert.callOrder(emptySpy, appendSpy);
        });
      });

      describe("addBaseform", function() {
        it("should find inside the hit a viewbaseform with the class 'cloze-style-baseform'", function() {
          const $hit = $("[data-type='hit']").first();

          view.cloze.addBaseform($hit);

          const $Baseform = $hit.find("viewbaseform.cloze-style-baseform");

          expect($Baseform.length).to.be.above(0);
        });

        it("should find in the hit the data 'lemma' with the lemma as content", function() {
          const $hit = $("[data-type='hit']").first();
          const lemma = "усвоение";

          expect($hit.data("lemma")).to.equal(lemma);
        });

        it("should find inside the hit a viewbaseform with the lemma form in brackets", function() {
          const $hit = $("[data-type='hit']").first();
          const lemma = $hit.data("lemma");

          view.cloze.addBaseform($hit);

          const $Baseform = $hit.find("viewbaseform");

          expect($Baseform.text()).to.equal(" (" + lemma + ")");
        });

        it("should not find a viewbaseform inside the hit as there is no lemma", function() {
          const $hit = $("[data-type='hit']").first();

          $hit.removeData("lemma");
          $hit.removeAttr("data-lemma");

          view.cloze.addBaseform($hit);

          const $Baseform = $hit.find("viewbaseform");

          expect($Baseform.length).to.equal(0);
        });
      })
    });
  });
});
