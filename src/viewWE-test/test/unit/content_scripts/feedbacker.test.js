/**
 * Tests for the feedbacker.js file of the VIEW add-on.
 *
 * Created by eduard on 10.04.17.
 */

"use strict";

describe("feedbacker.js", function() {
  let sandbox;

  fixture.load("/fixtures/unstressed-o-feedback.html");
  
  const performanceData = {
    "enhancement-id": "VIEW-N-Msc-Inan-Sg-Nom-5",
    "task-id": 1,
    "correct-answer": "процесс",
    "number-of-tries": 1,
    "used-solution": false,
    "assessment": "WRONG_SPELLING_UNSTRESSED_O"
  };

  const feedbackData = {
    "assessment": "WRONG_SPELLING_UNSTRESSED_O",
    "message": $("#feedback-message").html()
  };

  const submissionResponseData = {
    performance: performanceData,
    feedback: feedbackData
  };

  before(function() {
    $("body").append("<viewenhancement id='" + performanceData["enhancement-id"] + "'>" +
      "процесс</viewenhancement>");
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
    $("#view-feedback-dialog").remove();
    $("*").off();
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors for this module", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems
      sandbox.stub($.fn, "load").yields();

      view.toolbarIframe.init();

      expect($("#view-toolbar-iframe").length).to.be.above(0);

      expect($(".feedback-hint-btn").length).to.equal(3);
      expect($(".feedback-hint").length).to.equal(3);

      expect($("#feedback-hint-btn-1").length).to.be.above(0);
      expect($("#feedback-hint-btn-2").length).to.be.above(0);
      expect($("#feedback-hint-btn-3").length).to.be.above(0);
      expect($("#feedback-rule-btn").length).to.be.above(0);

      expect($("#feedback-hint-btn-1").data("feedback-level")).to.equal(1);
      expect($("#feedback-hint-btn-2").data("feedback-level")).to.equal(2);
      expect($("#feedback-hint-btn-3").data("feedback-level")).to.equal(3);

      expect($("#feedback-hint-1").length).to.be.above(0);
      expect($("#feedback-hint-2").length).to.be.above(0);
      expect($("#feedback-hint-3").length).to.be.above(0);
      expect($("#feedback-rule").length).to.be.above(0);
    });
  });

  describe("showFeedback", function() {
    it("should call addSubmissionResponseData($Dialog, performanceData, feedbackData)", function() {
      const addSubmissionResponseDataSpy = sandbox.spy(view.feedbacker, "addSubmissionResponseData");

      view.feedbacker.showFeedback(submissionResponseData);

      sinon.assert.calledOnce(addSubmissionResponseDataSpy);

      sinon.assert.calledWithExactly(addSubmissionResponseDataSpy,
        $("#view-feedback-dialog"),
        performanceData,
        feedbackData
      );
    });

    describe("addSubmissionResponseData", function() {
      it("should call lib.createList(id, items) to create the info list", function() {
        const createListSpy = sandbox.spy(view.lib, "createList");

        const $Dialog = $("<div>");
        $Dialog.attr("id", "view-feedback-dialog");

        view.feedbacker.addSubmissionResponseData($Dialog, performanceData, feedbackData);

        sinon.assert.calledOnce(createListSpy);
        sinon.assert.calledWithExactly(createListSpy,
          performanceData["enhancement-id"] + "-info",
          [
            "Number of tries: " + performanceData["number-of-tries"],
            "Assessment: Spelling error in unstressed 'o' position",
            "Message: " + feedbackData["message"]
          ]
        );
      });

      it("should find the info list inside the feedback dialog", function() {
        const $Dialog = $("<div>");
        $Dialog.attr("id", "view-feedback-dialog");

        view.feedbacker.addSubmissionResponseData($Dialog, performanceData, feedbackData);

        $("body").append($Dialog);

        expect($("#view-feedback-dialog").find("#" + performanceData["enhancement-id"] + "-info").length)
        .to.be.above(0);
      });
    });

    it("should call decideDialogPosition(enhancementId)", function() {
      const decideDialogPositionSpy = sandbox.spy(view.feedbacker, "decideDialogPosition");

      view.feedbacker.showFeedback(submissionResponseData);

      sinon.assert.calledOnce(decideDialogPositionSpy);

      sinon.assert.calledWithExactly(decideDialogPositionSpy,
        performanceData["enhancement-id"]
      );
    });

    describe("decideDialogPosition", function() {
      it("should decide where to place the dialog, decision bottom", function() {
        const enhancementId = "VIEW-N-Msc-Inan-Sg-Nom-5";

        $("#" + enhancementId).offset({ top: 200, left: 0 });

        const position = view.feedbacker.decideDialogPosition(enhancementId);

        expect(position).to.eql({
          my: "left bottom",
          at: "left top",
          of: "#view-toolbar-iframe"
        })
      });

      it("should decide where to place the dialog, decision top", function() {
        const enhancementId = "VIEW-N-Msc-Inan-Sg-Nom-5";

        $("#" + enhancementId).offset({ top: 500, left: 0 });

        const position = view.feedbacker.decideDialogPosition(enhancementId);

        expect(position).to.eql({
          my: "left top",
          at: "left top",
          of: window
        })
      });
    });

    it("should call lib.dialogSetup($Dialog, settings)", function() {
      const dialogSetupSpy = sandbox.spy(view.lib, "dialogSetup");

      const settings = {
        title: "Feedback",
        width: "auto",
        height: "auto",
        maxHeight: $(window).height() * 0.40,
        position: {
          my: "left bottom",
          at: "left top",
          of: "#view-toolbar-iframe"
        }
      };

      view.feedbacker.showFeedback(submissionResponseData);

      sinon.assert.calledOnce(dialogSetupSpy);
      sinon.assert.calledWithExactly(dialogSetupSpy,
        $("#view-feedback-dialog"),
        settings
      );
    });

    it("should call lib.initDialogClose($Dialog)", function() {
      const initDialogCloseSpy = sandbox.spy(view.lib, "initDialogClose");

      view.feedbacker.showFeedback(submissionResponseData);

      sinon.assert.calledOnce(initDialogCloseSpy);
      sinon.assert.calledWithExactly(initDialogCloseSpy,
        $("#view-feedback-dialog")
      );
    });

    it("should find the feedback dialog", function() {
      view.feedbacker.showFeedback(submissionResponseData);

      expect($("#view-feedback-dialog").length).to.be.above(0);
    });

    it("should call initFeedbackRuleBtn()", function() {
      const initFeedbackRuleBtnSpy = sandbox.spy(view.feedbacker, "initFeedbackRuleBtn");

      view.feedbacker.showFeedback(submissionResponseData);

      sinon.assert.calledOnce(initFeedbackRuleBtnSpy);
    });

    it("should initialize the feedback rule button handler", function() {
      const selectorSpy = sandbox.spy(document, "getElementById");
      const eventSpy = sandbox.spy($.fn, "on");

      view.feedbacker.initFeedbackRuleBtn();

      sinon.assert.calledOnce(selectorSpy.withArgs("feedback-rule-btn"));

      sinon.assert.called(eventSpy.withArgs("click"));
    });

    it("should call toggleFeedbackRule() on click", function() {
      const toggleFeedbackRuleSpy = sandbox.spy(view.feedbacker, "toggleFeedbackRule");

      view.feedbacker.initFeedbackRuleBtn();

      $("#feedback-rule-btn").trigger("click");

      sinon.assert.calledOnce(toggleFeedbackRuleSpy);
    });

    it("should toggle the feedback rule", function() {
      $("#feedback-rule").hide();

      view.feedbacker.toggleFeedbackRule();

      $("#feedback-rule-btn").trigger("click");

      expect($("#feedback-rule").css("display")).to.equal("block");
    });

    it("should call initFeedbackHintBtn(position)", function() {
      const initFeedbackHintBtnSpy = sandbox.spy(view.feedbacker, "initFeedbackHintBtn");

      view.feedbacker.showFeedback(submissionResponseData);

      sinon.assert.calledOnce(initFeedbackHintBtnSpy);
      sinon.assert.calledWithExactly(initFeedbackHintBtnSpy, {
        my: "left bottom",
        at: "left top",
        of: "#view-toolbar-iframe"
      });
    });

    it("should initialize the feedback hint button handler", function() {
      const selectorSpy = sandbox.spy($.fn, "find");
      const eventSpy = sandbox.spy($.fn, "on");

      view.feedbacker.initFeedbackHintBtn({
        my: "left top",
        at: "left top",
        of: window
      });

      sinon.assert.calledOnce(selectorSpy.withArgs(".feedback-hint-btn"));

      sinon.assert.called(eventSpy.withArgs("click"));
    });

    it("should call toggleHintAndShowNextHintBtn(feedbackLevel, position) on click", function() {
      const $Dialog = $("<div>").attr("id", "view-feedback-dialog");

      $("body").append($Dialog);

      view.lib.dialogSetup($Dialog, {});

      const toggleHintAndShowNextHintBtnSpy = sandbox.spy(view.feedbacker, "toggleHintAndShowNextHintBtn");

      const position = {
        my: "left top",
        at: "left top",
        of: window
      };

      view.feedbacker.initFeedbackHintBtn(position);

      $("#feedback-hint-btn-1").trigger("click");

      sinon.assert.calledOnce(toggleHintAndShowNextHintBtnSpy);
      sinon.assert.calledWithExactly(toggleHintAndShowNextHintBtnSpy,
        1,
        position
      );
    });

    describe("toggleHintAndShowNextHintBtn", function() {
      it("should show the feedback hint, hint was hidden before", function() {
        const $Dialog = $("<div>").attr("id", "view-feedback-dialog");

        $("body").append($Dialog);

        view.lib.dialogSetup($Dialog, {});

        $("#feedback-hint-1").hide();

        const position = {
          my: "left top",
          at: "left top",
          of: window
        };

        view.feedbacker.toggleHintAndShowNextHintBtn(1, position);

        expect($("#feedback-hint-1").css("display")).to.equal("block");
      });

      it("should show the next feedback hint button, hint was hidden before", function() {
        const $Dialog = $("<div>").attr("id", "view-feedback-dialog");

        $("body").append($Dialog);

        view.lib.dialogSetup($Dialog, {});

        $("#feedback-hint-btn-2").hide();
        $("#feedback-hint-1").hide();

        const position = {
          my: "left top",
          at: "left top",
          of: window
        };

        view.feedbacker.toggleHintAndShowNextHintBtn(1, position);

        expect($("#feedback-hint-btn-2").css("display")).to.equal("inline-block");
      });

      it("should call view.lib.scrollToElement($Dialog, $ScrollArea), hint was hidden before", function() {
        const $Dialog = $("<div>").attr("id", "view-feedback-dialog");

        $("body").append($Dialog);

        view.lib.dialogSetup($Dialog, {});

        $("#feedback-hint-1").hide();

        const scrollToElementSpy = sandbox.spy(view.lib, "scrollToElement");

        const feedbackLevel = 1;
        const position = {
          my: "left top",
          at: "left top",
          of: window
        };

        view.feedbacker.toggleHintAndShowNextHintBtn(feedbackLevel, position);

        sinon.assert.called(scrollToElementSpy);
        sinon.assert.calledWithExactly(scrollToElementSpy,
          $("#feedback-hint-" + feedbackLevel),
          $("#view-feedback-dialog")
        );
      });

      it("should hide the feedback hint, hint was visible before", function() {
        const $Dialog = $("<div>").attr("id", "view-feedback-dialog");

        $("body").append($Dialog);

        view.lib.dialogSetup($Dialog, {});

        $("#feedback-hint-1").show();

        const position = {
          my: "left top",
          at: "left top",
          of: window
        };

        view.feedbacker.toggleHintAndShowNextHintBtn(1, position);

        expect($("#feedback-hint-1").css("display")).to.equal("none");
      });

      it("should adjust the dialog position as the width and height likely changed in any case", function() {
        const $Dialog = $("<div>").attr("id", "view-feedback-dialog");

        $("body").append($Dialog);

        view.lib.dialogSetup($Dialog, {});

        const position = {
          my: "left bottom",
          at: "left top",
          of: "#view-toolbar-iframe"
        };

        const dialogSpy = sandbox.spy($.fn, "dialog");

        view.feedbacker.toggleHintAndShowNextHintBtn(1, position);

        sinon.assert.calledOnce(dialogSpy);
        sinon.assert.calledWithExactly(dialogSpy,
          "option",
          "position",
          position
        );
      });
    });

    it("should show the first feedback hint button", function() {
      $("#feedback-hint-btn-1").hide();

      view.feedbacker.showFeedback(submissionResponseData);

      expect($("#feedback-hint-btn-1").css("display")).to.equal("inline-block");
    });
  });
});
