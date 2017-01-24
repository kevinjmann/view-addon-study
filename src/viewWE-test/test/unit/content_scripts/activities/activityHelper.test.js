/**
 * Tests for the activityHelper.js file of the VIEW add-on.
 *
 * Created by eduard on 21.01.17.
 */

"use strict";

describe("activityHelper.js", function() {
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

  describe("createHitList", function() {
    it("should create a hitlist", function() {
      const hitList = [];

      $("viewenhancement[data-type='hit']").each(function() {
        hitList.push($(this));
      });

      const returnedHitList = view.activityHelper.createHitList();

      expect(returnedHitList).to.eql(hitList);
      expect(returnedHitList.length).to.equal(19);
    });
  });

  describe("exerciseHandler", function() {
    it("should call calculateNumberOfExercises(hitList)", function() {
      const calculateNumberOfExercisesSpy = sandbox.spy(view.activityHelper, "calculateNumberOfExercises");

      const hitList = view.activityHelper.createHitList();

      view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

      sinon.assert.calledOnce(calculateNumberOfExercisesSpy);
      sinon.assert.calledWithExactly(calculateNumberOfExercisesSpy, hitList);
    });

    describe("calculateNumberOfExercises", function() {
      it("should use fixedNumberOfExercises, as fixedOrPercentage is set to 0", function() {
        const hitList = view.activityHelper.createHitList();

        view.fixedOrPercentage = 0;

        view.fixedNumberOfExercises = 10;

        const numberOfExercises = view.activityHelper.calculateNumberOfExercises(hitList);

        expect(numberOfExercises).to.equal(10);
      });

      it("should use percentageOfExercises, as fixedOrPercentage is set to 1", function() {
        const hitList = view.activityHelper.createHitList();

        view.fixedOrPercentage = 1;

        view.percentageOfExercises = 20;

        const numberOfExercises = view.activityHelper.calculateNumberOfExercises(hitList);

        expect(numberOfExercises).to.equal(Math.round(.2 * hitList.length));
      });
    });

    it("should call chooseWhichExercises(hitList)", function() {
      const chooseWhichExercisesSpy = sandbox.spy(view.activityHelper, "chooseWhichExercises");

      const hitList = view.activityHelper.createHitList();

      view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

      sinon.assert.calledOnce(chooseWhichExercisesSpy);
      sinon.assert.calledWithExactly(chooseWhichExercisesSpy, hitList);
    });

    describe("chooseWhichExercises", function() {
      it("should call shuffleList(hitList), as choiceMode is set to 0", function() {
        const shuffleListSpy = sandbox.spy(view.lib, "shuffleList");

        const hitList = view.activityHelper.createHitList();

        view.choiceMode = 0;

        const exercises = view.activityHelper.chooseWhichExercises(hitList);

        sinon.assert.calledOnce(shuffleListSpy);
        sinon.assert.calledWithExactly(shuffleListSpy, hitList);

        expect(exercises).to.eql({
          firstOffset: 0,
          intervalSize: 1
        });
      });

      it("should set firstOffset to the set value in view, as choiceMode is set to 1", function() {
        const hitList = view.activityHelper.createHitList();

        view.choiceMode = 1;

        view.firstOffset = 5;

        const exercises = view.activityHelper.chooseWhichExercises(hitList);

        expect(exercises).to.eql({
          firstOffset: 5,
          intervalSize: 1
        });
      });

      it("should set intervalSize to the set value in view, as choiceMode is set to 2", function() {
        const hitList = view.activityHelper.createHitList();

        view.choiceMode = 2;

        view.intervalSize = 4;

        const exercises = view.activityHelper.chooseWhichExercises(hitList);

        expect(exercises).to.eql({
          firstOffset: 0,
          intervalSize: 4
        });
      });
    });

    it("should call createExercises(numExercises, exerciseOptions, hitList, createExercise)", function() {
      const createExercisesSpy = sandbox.spy(view.activityHelper, "createExercises");

      const hitList = view.activityHelper.createHitList();

      view.fixedOrPercentage = 1;

      view.percentageOfExercises = 100;

      view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

      sinon.assert.calledOnce(createExercisesSpy);
      sinon.assert.calledWith(createExercisesSpy,
        19,
        {
          firstOffset: 0,
          intervalSize: 1
        }
      );
    });

    describe("createExercises", function() {
      it("should create no exercises, as the number of exercises is 0", function() {
        const createExerciseSpy = sandbox.spy(view.mc, "createExercise");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.createExercises(
          0,
          {
            firstOffset: 0,
            intervalSize: 1
          },
          hitList,
          view.mc.createExercise
        );

        sinon.assert.notCalled(createExerciseSpy);
      });

      it("should create at most as much exercises as there are hit list elements", function() {
        const createExerciseSpy = sandbox.spy(view.mc, "createExercise");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.createExercises(
          hitList.length + 1,
          {
            firstOffset: 0,
            intervalSize: 1
          },
          hitList,
          view.mc.createExercise
        );

        sinon.assert.callCount(createExerciseSpy, hitList.length);
      });

      it("should create 10 exercises", function() {
        const createExerciseSpy = sandbox.spy(view.mc, "createExercise");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.createExercises(
          10,
          {
            firstOffset: 0,
            intervalSize: 1
          },
          hitList,
          view.mc.createExercise
        );

        sinon.assert.callCount(createExerciseSpy, 10);
      });

      it("should create exercises starting from the fifth element onwards", function() {
        const createExerciseSpy = sandbox.spy(view.mc, "createExercise");

        const hitList = view.activityHelper.createHitList();
        const firstOffset = 4;
        const intervalSize = 1;

        view.activityHelper.createExercises(
          hitList.length,
          {
            firstOffset,
            intervalSize
          },
          hitList,
          view.mc.createExercise
        );

        sinon.assert.callCount(createExerciseSpy, hitList.length - firstOffset);

        let call = 0;
        for (let exerciseNumber = firstOffset; exerciseNumber < hitList.length; exerciseNumber += intervalSize) {
          sinon.assert.calledWithExactly(createExerciseSpy.getCall(call), hitList[exerciseNumber]);
          call++;
        }
      });

      it("should create exercises in intervals of two, each second element is an exercise", function() {
        const createExerciseSpy = sandbox.spy(view.mc, "createExercise");

        const hitList = view.activityHelper.createHitList();
        const firstOffset = 0;
        const intervalSize = 2;

        view.activityHelper.createExercises(
          hitList.length,
          {
            firstOffset,
            intervalSize
          },
          hitList,
          view.mc.createExercise
        );

        sinon.assert.callCount(createExerciseSpy, Math.ceil(hitList.length / intervalSize));

        let call = 0;
        for (let exerciseNumber = firstOffset; exerciseNumber < hitList.length; exerciseNumber += intervalSize) {
          sinon.assert.calledWithExactly(createExerciseSpy.getCall(call), hitList[exerciseNumber]);
          call++;
        }
      });
    });

    it("should initialize the input and hint handler", function() {
      const eventSpy = sandbox.spy($.fn, "on");

      const hitList = view.activityHelper.createHitList();

      view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

      sinon.assert.calledTwice(eventSpy);
      sinon.assert.calledWithExactly(eventSpy.firstCall,
        "change",
        view.activityHelper.inputHandler
      );
      sinon.assert.calledWithExactly(eventSpy.secondCall,
        "click",
        view.activityHelper.hintHandler
      );
    });

    it("should call the input handler on change", function() {
      const inputHandlerSpy = sandbox.spy(view.activityHelper, "inputHandler");

      const hitList = view.activityHelper.createHitList();

      view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

      const $ElementBox = $(".viewinput").first();
      const $Option = $ElementBox.find("option").eq(1);

      $ElementBox.val($Option.text()).trigger("change");

      sinon.assert.calledOnce(inputHandlerSpy);
    });

    describe("inputHandler", function() {
      it("should call processCorrect($ElementBox, 'correct'), as the correct option was selected", function() {
        const processCorrectSpy = sandbox.spy(view.activityHelper, "processCorrect");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

        const $ElementBox = $(".viewinput").first();
        const answer = $ElementBox.data("view-answer");

        $ElementBox.val(answer).trigger("change");

        delete $ElementBox.prevObject;

        sinon.assert.calledOnce(processCorrectSpy);
        sinon.assert.calledWithExactly(processCorrectSpy,
          $ElementBox,
          "correct"
        );
      });

      it("should call processIncorrect($ElementBox), as the incorrect option was selected", function() {
        const processIncorrectSpy = sandbox.spy(view.activityHelper, "processIncorrect");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

        const $ElementBox = $(".viewinput").first();
        const answer = $ElementBox.data("view-answer");

        const $IncorrectOptions = $ElementBox.find("option").filter(function(){
          return $(this).text().toLowerCase() !== answer.toLowerCase();
        });

        $ElementBox.val($IncorrectOptions.eq(1).text()).trigger("change");

        delete $ElementBox.prevObject;

        sinon.assert.calledOnce(processIncorrectSpy);
        sinon.assert.calledWithExactly(processIncorrectSpy, $ElementBox);
      });

      it("should call collectAndSendData($Enhancement, input, countsAsCorrect, usedHint), as the userid is defined", function() {
        const collectAndSendDataSpy = sandbox.spy(view.collector, "collectAndSendData");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

        const $ElementBox = $(".viewinput").first();
        const $EnhancementElement = $ElementBox.parent();
        const answer = $ElementBox.data("view-answer");
        const countAsCorrect = true;
        const usedHint = false;

        view.userid = "someid";

        $ElementBox.val(answer).trigger("change");

        delete $ElementBox.prevObject;

        sinon.assert.calledOnce(collectAndSendDataSpy);
        sinon.assert.calledWithExactly(collectAndSendDataSpy,
          $EnhancementElement,
          answer,
          countAsCorrect,
          usedHint
        );
      });

      it("should return false in any case", function() {
        const inputHandlerSpy = sandbox.spy(view.activityHelper, "inputHandler");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

        const $ElementBox = $(".viewinput").first();
        const answer = $ElementBox.data("view-answer");

        $ElementBox.val(answer).trigger("change");

        expect(inputHandlerSpy.firstCall.returnValue).to.be.false;
      });

      describe("processCorrect", function() {
        it("should call colorClue(clueId, clueStyleColor)", function() {
          const colorClueSpy = sandbox.spy(view.activityHelper, "colorClue");

          const hitList = view.activityHelper.createHitList();

          view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

          const $ElementBox = $(".viewinput").first();
          const $EnhancementElement = $ElementBox.parent();
          const clueId = $EnhancementElement.data("clueId");

          view.activityHelper.processCorrect($ElementBox, "correct");

          sinon.assert.calledOnce(colorClueSpy);
          sinon.assert.calledWithExactly(colorClueSpy, clueId, "inherit");
        });

        // it("should color a clue with 'red' and 'inherit'", function() {
        //   const clueId = "VIEW-Pr-5";
        //   const $Clue = $("[data-id='" + clueId + "']");
        //   let clueStyleColor = "red";
        //
        //   view.activityHelper.colorClue(clueId, clueStyleColor);
        //
        //   expect($Clue.css("color")).to.equal(clueStyleColor);
        //
        //   clueStyleColor = "inherit";
        //
        //   view.activityHelper.colorClue(clueId, clueStyleColor);
        //
        //   expect($Clue.css("color")).to.equal(clueStyleColor);
        // });

        it("should have the class 'input-style-correct' in the enhancement element", function() {
          const hitList = view.activityHelper.createHitList();

          view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

          const $ElementBox = $(".viewinput").first();
          const $EnhancementElement = $ElementBox.parent();

          view.activityHelper.processCorrect($ElementBox, "correct");

          expect($EnhancementElement.hasClass("input-style-correct")).to.be.true;
        });

        it("should have the answer as html in the enhancement element", function() {
          const hitList = view.activityHelper.createHitList();

          view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

          const $ElementBox = $(".viewinput").first();
          const $EnhancementElement = $ElementBox.parent();
          const answer = $ElementBox.data("view-answer");

          view.activityHelper.processCorrect($ElementBox, "correct");

          expect($EnhancementElement.html()).to.equal(answer);
        });

        it("should call jumpTo(elementId)", function() {
          const jumpToSpy = sandbox.spy(view.activityHelper, "jumpTo");

          const hitList = view.activityHelper.createHitList();

          view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

          const $ElementBox = $(".viewinput").first();

          view.activityHelper.processCorrect($ElementBox, "correct");

          sinon.assert.calledOnce(jumpToSpy);
          sinon.assert.calledWithExactly(jumpToSpy, 0);
        });
        
        describe("jumpTo", function() {
          it("should call scrollToCenter($Element) and jump to the given element id, as it exists", function() {
            const scrollToCenterSpy = sandbox.spy(view.activityHelper, "scrollToCenter");

            const hitList = view.activityHelper.createHitList();

            view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

            const elementId = 1;
            const $Element = $(".viewinput").eq(elementId);

            view.activityHelper.jumpTo(elementId);

            sinon.assert.calledOnce(scrollToCenterSpy);
            sinon.assert.calledWithExactly(scrollToCenterSpy, $Element);
          });

          it("should call scrollToCenter($FirstInput) and jump to the first element, as the element id does not exist", function() {
            const scrollToCenterSpy = sandbox.spy(view.activityHelper, "scrollToCenter");

            const hitList = view.activityHelper.createHitList();

            view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

            const elementId = 100;
            const $FirstElement = $(".viewinput").eq(0);

            view.activityHelper.jumpTo(elementId);

            sinon.assert.calledOnce(scrollToCenterSpy);
            sinon.assert.calledWithExactly(scrollToCenterSpy, $FirstElement);
          });

          describe("scrollToCenter", function() {
            it("should have focus on the element", function() {
              const hitList = view.activityHelper.createHitList();

              view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

              const elementId = 1;
              const $Element = $(".viewinput").eq(elementId);

              expect($Element.is(":focus")).to.be.false;

              view.activityHelper.scrollToCenter($Element);

              expect($Element.is(":focus")).to.be.true;
            });

            it("should scroll to the center of the viewport", function() {
              const scrollTopSpy = sandbox.spy($.fn, "scrollTop");

              const hitList = view.activityHelper.createHitList();

              view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

              const elementId = 1;
              const $Element = $(".viewinput").eq(elementId);
              const $Window = $(window);

              view.activityHelper.scrollToCenter($Element);

              sinon.assert.calledOnce(scrollTopSpy);
              sinon.assert.calledWithExactly(scrollTopSpy, $Element.offset().top - ($Window.height() / 2));
            });
          });
        });
      });

      describe("processIncorrect", function() {
        it("should call colorClue(clueId, clueStyleColor)", function() {
          const colorClueSpy = sandbox.spy(view.activityHelper, "colorClue");

          const hitList = view.activityHelper.createHitList();

          view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

          const $ElementBox = $(".viewinput").first();
          const $EnhancementElement = $ElementBox.parent();
          const clueId = $EnhancementElement.data("clueId");

          view.activityHelper.processIncorrect($ElementBox);

          sinon.assert.calledOnce(colorClueSpy);
          sinon.assert.calledWithExactly(colorClueSpy, clueId, "red");
        });

        it("should have the class 'input-style-incorrect' in the element box", function() {
          const hitList = view.activityHelper.createHitList();

          view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

          const $ElementBox = $(".viewinput").first();

          view.activityHelper.processIncorrect($ElementBox);

          expect($ElementBox.hasClass("input-style-incorrect")).to.be.true;
        });

        it("should call removeAttr('class')", function() {
          const removeAttrSpy = sandbox.spy($.fn, "removeAttr");

          const hitList = view.activityHelper.createHitList();

          view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

          const $ElementBox = $(".viewinput").first();
          const answer = $ElementBox.data("view-answer");

          const $IncorrectOptions = $ElementBox.find("option").filter(function(){
            return $(this).text().toLowerCase() !== answer.toLowerCase();
          });

          $IncorrectOptions.eq(1).prop("selected", true);

          view.activityHelper.processIncorrect($ElementBox);

          sinon.assert.calledOnce(removeAttrSpy);
          sinon.assert.calledWithExactly(removeAttrSpy, "class");
        });

        it("should add class 'input-style-incorrect' to the incorrectly selected option", function() {
          const hitList = view.activityHelper.createHitList();

          view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

          const $ElementBox = $(".viewinput").first();
          const answer = $ElementBox.data("view-answer");

          const $IncorrectOptions = $ElementBox.find("option").filter(function(){
            return $(this).text().toLowerCase() !== answer.toLowerCase();
          });

          $IncorrectOptions.eq(1).prop("selected", true);

          view.activityHelper.processIncorrect($ElementBox);

          expect($ElementBox.find("option:selected").attr("class")).to.equal("input-style-incorrect");
        });

        it("should add class 'input-style-neutral' to the unselected options", function() {
          const hitList = view.activityHelper.createHitList();

          view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

          const $ElementBox = $(".viewinput").first();
          const answer = $ElementBox.data("view-answer");

          const $IncorrectOptions = $ElementBox.find("option").filter(function(){
            return $(this).text().toLowerCase() !== answer.toLowerCase();
          });

          $IncorrectOptions.eq(1).prop("selected", true);

          view.activityHelper.processIncorrect($ElementBox);

          $ElementBox.find("option:not(:selected)").each(function() {
            expect($(this).attr("class")).to.equal("input-style-neutral");
          });
        });
      });
    });

    it("should call the hint handler on click", function() {
      const hintHandlerSpy = sandbox.spy(view.activityHelper, "hintHandler");

      const hitList = view.activityHelper.createHitList();

      view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

      $("viewhint").first().trigger("click");

      sinon.assert.calledOnce(hintHandlerSpy);
    });

    describe("hintHandler", function() {
      it("should call processCorrect($ElementBox, 'provided')", function() {
        const processCorrectSpy = sandbox.spy(view.activityHelper, "processCorrect");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

        const $Hint = $("viewhint").first();
        const $ElementBox = $Hint.prev();

        $Hint.trigger("click");

        delete $Hint.prevObject;

        sinon.assert.calledOnce(processCorrectSpy);
        sinon.assert.calledWithExactly(processCorrectSpy,
          $ElementBox,
          "provided"
        );
      });

      it("should call collectAndSendData($Enhancement, input, countsAsCorrect, usedHint), as the userid is defined", function() {
        const collectAndSendDataSpy = sandbox.spy(view.collector, "collectAndSendData");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

        const $Hint = $("viewhint").first();
        const $ElementBox = $Hint.prev();
        const $EnhancementElement = $ElementBox.parent();
        const countAsCorrect = true;
        const usedHint = true;

        view.userid = "someid";

        $Hint.trigger("click");

        delete $Hint.prevObject;

        sinon.assert.calledOnce(collectAndSendDataSpy);
        sinon.assert.calledWithExactly(collectAndSendDataSpy,
          $EnhancementElement,
          "no input",
          countAsCorrect,
          usedHint
        );
      });

      it("should return false in any case", function() {
        const hintHandlerSpy = sandbox.spy(view.activityHelper, "hintHandler");

        const hitList = view.activityHelper.createHitList();

        view.activityHelper.exerciseHandler(hitList, view.mc.createExercise);

        const $Hint = $("viewhint").first();

        $Hint.trigger("click");

        expect(hintHandlerSpy.firstCall.returnValue).to.be.false;
      });
    });
  });
  
  describe("getCorrectAnswer", function() {
    it("should call matchCapitalization($hit.data('correctform'), capType) as the language is 'ru'", function() {
      const getCorrectAnswerSpy = sandbox.spy(view.activityHelper, "getCorrectAnswer");
      const matchCapitalizationSpy = sandbox.spy(view.lib, "matchCapitalization");

      const $hit = $("[data-type='hit']").first();

      view.language = "ru";

      view.activityHelper.getCorrectAnswer($hit, 2);

      sinon.assert.calledOnce(matchCapitalizationSpy);
      sinon.assert.calledWithExactly(matchCapitalizationSpy,
        "усвоение",
        2
      );

      expect(getCorrectAnswerSpy.firstCall.returnValue).to.equal("Усвоение");
    });

    it("should return the hit text as the language is not 'ru'", function() {
      const getCorrectAnswerSpy = sandbox.spy(view.activityHelper, "getCorrectAnswer");

      const $hit = $("[data-type='hit']").first();

      view.language = "en";

      view.activityHelper.getCorrectAnswer($hit, 2);

      expect(getCorrectAnswerSpy.firstCall.returnValue).to.equal("Усвое́ние");
    });
  });

  describe("createHint", function() {
    it("should have the class 'view-style-hint' in the viewhint inside the hit", function() {
      const $hit = $("[data-type='hit']").first();

      view.activityHelper.createHint($hit);

      expect($hit.find(".view-style-hint").length).to.be.above(0);
    });

    it("should have the text '?' in the viewhint inside the hit", function() {
      const $hit = $("[data-type='hit']").first();

      view.activityHelper.createHint($hit);

      expect($hit.find("viewhint").text()).to.equal("?");
    });
  });

  describe("restore", function() {
    it("should remove the click handler", function() {
      const $FirstEnhancementElement = $("viewenhancement").get(0);

      expect($._data($FirstEnhancementElement, "events")).to.be.undefined;

      view.click.run();

      expect($._data($FirstEnhancementElement, "events")).to.exist;

      view.activityHelper.restore();

      expect($._data($FirstEnhancementElement, "events")).to.be.undefined;
    });

    it("should remove the input handler", function() {
      view.mc.run();

      const $FirstElementBox = $(".viewinput").get(0);

      expect($._data($FirstElementBox, "events")).to.exist;

      view.activityHelper.restore();

      expect($._data($FirstElementBox, "events")).to.be.undefined;
    });

    it("should remove the hint handler", function() {
      view.mc.run();

      const $FirstHint = $("viewhint").get(0);

      expect($._data($FirstHint, "events")).to.exist;

      view.activityHelper.restore();

      expect($._data($FirstHint, "events")).to.be.undefined;
    });

    it("should remove the hint", function() {
      view.mc.run();

      expect($("viewhint").get(0)).to.exist;

      view.activityHelper.restore();

      expect($("viewhint").get(0)).to.be.undefined;
    });

    it("should remove the baseform", function() {
      view.cloze.run();

      expect($("viewbaseform").get(0)).to.exist;

      view.activityHelper.restore();

      expect($("viewbaseform").get(0)).to.be.undefined;
    });
  })
});
