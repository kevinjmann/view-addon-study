/**
 * Tests for the mc.js file of the VIEW add-on.
 *
 * Created by eduard on 20.01.17.
 */

"use strict";

describe("mc.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/ru-nouns-mc-and-cloze.html");
    view.language = "ru";
  });

  afterEach(function() {
    sandbox.restore();
    fixture.cleanup();
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

      const hitList = [];

      $("viewenhancement[data-type='hit']").each(function() {
        hitList.push($(this));
      });

      view.mc.run();

      sinon.assert.calledOnce(createHitListSpy);

      expect(createHitListSpy.firstCall.returnValue)
      .to.eql(hitList);

      sinon.assert.calledOnce(exerciseHandlerSpy);
      sinon.assert.calledWithExactly(exerciseHandlerSpy,
        hitList,
        view.mc.createExercise
      );
    });

    describe("createExercise", function() {
      it("should call detectCapitalization(hitText)", function() {
        const detectCapitalizationSpy = sandbox.spy(view.lib, "detectCapitalization");

        const $hit = $("[data-type='hit']").first();
        const hitText = $hit.text().trim();

        view.mc.createExercise($hit);

        sinon.assert.calledOnce(detectCapitalizationSpy);
        sinon.assert.calledWithExactly(detectCapitalizationSpy, hitText);

        expect(detectCapitalizationSpy.firstCall.returnValue).to.equal(2);
      });

      it("should call getCorrectAnswer($hit, capType)", function() {
        const getCorrectAnswerSpy = sandbox.spy(view.activityHelper, "getCorrectAnswer");

        const $hit = $("[data-type='hit']").first();

        view.mc.createExercise($hit);

        sinon.assert.calledOnce(getCorrectAnswerSpy);
        sinon.assert.calledWithExactly(getCorrectAnswerSpy,
          $hit,
          2
        );

        expect(getCorrectAnswerSpy.firstCall.returnValue).to.equal("Усвоение");
      });

      it("should call getOptions($hit, answer, capType)", function() {
        const getOptionsSpy = sandbox.spy(view.mc, "getOptions");

        const $hit = $("[data-type='hit']").first();
        const capType = 2;
        const answer = view.activityHelper.getCorrectAnswer($hit, capType);

        view.mc.createExercise($hit);

        sinon.assert.calledOnce(getOptionsSpy);
        sinon.assert.calledWithExactly(getOptionsSpy,
          $hit,
          answer,
          capType
        );

        expect(getOptionsSpy.firstCall.returnValue)
        .to.have.members(["Усвоение","Усвоении","Усвоению","Усвоением","Усвоения"]);
      });// HERE

      it("should call createSelectBox(options, hitText, answer, $hit)", function() {
        const getOptionsSpy = sandbox.spy(view.mc, "getOptions");
        const createSelectBoxSpy = sandbox.spy(view.mc, "createSelectBox");

        const $hit = $("[data-type='hit']").first();
        const hitText = $hit.text().trim();
        const capType = 2;
        const answer = view.activityHelper.getCorrectAnswer($hit, capType);

        view.mc.createExercise($hit);

        sinon.assert.calledOnce(createSelectBoxSpy);
        sinon.assert.calledWithExactly(createSelectBoxSpy,
          getOptionsSpy.firstCall.returnValue,
          hitText,
          answer,
          $hit
        );
      });

      it("should call createHint($hit)", function() {
        const createHintSpy = sandbox.spy(view.activityHelper, "createHint");

        const $hit = $("[data-type='hit']").first();

        view.mc.createExercise($hit);

        sinon.assert.calledOnce(createHintSpy);
        sinon.assert.calledWithExactly(createHintSpy, $hit);
      });

      describe("getOptions", function() {
        it("should call fillOptions(distractors, answer, capType)", function() {
          const fillOptionsSpy = sandbox.spy(view.mc, "fillOptions");

          const $hit = $("[data-type='hit']").first();
          const distractors = $hit.data("distractors").split(";");
          const capType = 2;
          const answer = view.activityHelper.getCorrectAnswer($hit, capType);

          view.mc.getOptions($hit, answer, capType);

          sinon.assert.calledOnce(fillOptionsSpy);
          sinon.assert.calledWithExactly(fillOptionsSpy,
            distractors,
            answer,
            capType
          );

          expect(distractors)
          .to.eql(["усвоению","усвоения","усвоением","усвоение","усвоении"]);

          expect(fillOptionsSpy.firstCall.returnValue)
          .to.have.members(["Усвоение","Усвоении","Усвоению","Усвоением","Усвоения"]);
        });

        describe("fillOptions", function() {
          it("should call addOption(options, distractor, capType) only 5 times, options length is limit", function() {
            const addOptionSpy = sandbox.spy(view.mc, "addOption");

            const distractors = [
              "видит",
              "видят",
              "вижу",
              "видим",
              "видите",
              "видишь"
            ];

            view.mc.fillOptions(distractors, "видят", 0);

            sinon.assert.callCount(addOptionSpy, 5);

            expect(addOptionSpy.getCall(4).args[1]).to.equal("видят");
          });

          it("should call addOption(options, distractor, capType) 3 times, distractor length is limit", function() {
            const addOptionSpy = sandbox.spy(view.mc, "addOption");

            const distractors = [
              "роль",
              "роли",
              "ролью"
            ];

            view.mc.fillOptions(distractors, "роли", 0);

            sinon.assert.callCount(addOptionSpy, 3);

            expect(addOptionSpy.getCall(2).args[1]).to.equal("роли");
          });

          it("should add an option to all options", function() {
            const options = [];

            view.mc.addOption(options, "усвоение", 2);

            expect(options).to.eql(["Усвоение"]);
          });

          it("should call shuffleList(options)", function() {
            const shuffleListSpy = sandbox.spy(view.lib, "shuffleList");

            const distractors = [
              "роль",
              "роли",
              "ролью"
            ];

            view.mc.fillOptions(distractors, "роли", 0);

            sinon.assert.calledOnce(shuffleListSpy);
            expect(shuffleListSpy.firstCall.args[0]).to.have.members(distractors);
          });
        });
      });

      describe("createSelectBox", function() {
        it("should find a select box with the class 'viewinput' inside the hit", function() {
          const options = ["Усвоение","Усвоении","Усвоению","Усвоением","Усвоения"];
          const $hit = $("[data-type='hit']").first();
          const hitText = $hit.text().trim();
          const answer = "Усвоение";

          view.mc.createSelectBox(options, hitText, answer, $hit);

          expect($hit.find("select.viewinput").length).to.be.above(0);
        });

        it("should have all options inside the select box", function() {
          const options = ["Усвоение","Усвоении","Усвоению","Усвоением","Усвоения"];
          const $hit = $("[data-type='hit']").first();
          const hitText = $hit.text().trim();
          const answer = "Усвоение";

          view.mc.createSelectBox(options, hitText, answer, $hit);

          const selectBoxOptions = [];
          $hit.find("option").each(function() {
            selectBoxOptions.push($(this).text());
          });

          expect(selectBoxOptions[0]).to.equal(" ");
          expect(selectBoxOptions).to.include.members(options);
        });

        it("should find the data 'view-answer' in the select box", function() {
          const options = ["Усвоение","Усвоении","Усвоению","Усвоением","Усвоения"];
          const $hit = $("[data-type='hit']").first();
          const hitText = $hit.text().trim();
          const answer = "Усвоение";

          view.mc.createSelectBox(options, hitText, answer, $hit);

          const $SelectBox = $hit.find("select.viewinput");

          expect($SelectBox.data("view-answer")).to.equal(answer);
        });

        it("should call empty() before append($SelectBox)", function() {
          const emptySpy = sandbox.spy($.fn, "empty");
          const appendSpy = sandbox.spy($.fn, "append");

          const options = ["Усвоение","Усвоении","Усвоению","Усвоением","Усвоения"];
          const $hit = $("[data-type='hit']").first();
          const hitText = $hit.text().trim();
          const answer = "Усвоение";

          view.mc.createSelectBox(options, hitText, answer, $hit);

          sinon.assert.called(emptySpy); // unexpectedly called 6 times

          sinon.assert.called(appendSpy); // unexpectedly called 7 times

          sinon.assert.callOrder(emptySpy, appendSpy);
        });
      })
    });
  });
});
