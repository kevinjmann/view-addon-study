/**
 * Tests for the feedbacker.js file of the VIEW add-on.
 *
 * Created by eduard on 10.04.17.
 */

"use strict";

describe("feedbacker.js", function() {
  let sandbox;
  
  const performanceData = {
    "enhancement-id": "bar",
    "task-id": 1,
    "correct-answer": "submission",
    "number-of-tries": 1,
    "used-solution": false,
    "assessment": "CORRECT"
  };

  const feedbackData = {
    "assessment": "EXACT_MATCH",
    "message": "Good job!"
  };

  const submissionResponseData = {
    performance: performanceData,
    feedback: feedbackData
  };

  before(function() {
    $("body").append("<div id='" + performanceData["enhancement-id"] + "'>");
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
    $("#view-feedback-dialog").remove();
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
      it("should call lib.createList(id, items) to create the info list without feedback data", function() {
        const createListSpy = sandbox.spy(view.lib, "createList");

        const $Dialog = $("<div>");
        $Dialog.attr("id", "view-feedback-dialog");

        view.feedbacker.addSubmissionResponseData($Dialog, performanceData, undefined);

        sinon.assert.calledOnce(createListSpy);
        sinon.assert.calledWithExactly(createListSpy,
          "bar-info",
          [
            "Number of tries: " + performanceData["number-of-tries"],
            "Assessment: " + performanceData["assessment"]
          ]
        );
      });

      it("should call lib.createList(id, items) to create the info list with feedback data", function() {
        const createListSpy = sandbox.spy(view.lib, "createList");

        const $Dialog = $("<div>");
        $Dialog.attr("id", "view-feedback-dialog");

        view.feedbacker.addSubmissionResponseData($Dialog, performanceData, feedbackData);

        sinon.assert.calledOnce(createListSpy);
        sinon.assert.calledWithExactly(createListSpy,
          "bar-info",
          [
            "Number of tries: " + performanceData["number-of-tries"],
            "Assessment: " + feedbackData["assessment"],
            "Message: " + feedbackData["message"]
          ]
        );
      });

      it("should find the info list inside the feedback dialog", function() {
        const $Dialog = $("<div>");
        $Dialog.attr("id", "view-feedback-dialog");

        view.feedbacker.addSubmissionResponseData($Dialog, performanceData, feedbackData);

        $("body").append($Dialog);

        expect($("#view-feedback-dialog").find("#bar-info").length).to.be.above(0);
      });
    });

    it("should call lib.dialogSetup($Dialog, title, height, position)", function() {
      const dialogSetupSpy = sandbox.spy(view.lib, "dialogSetup");

      const isModal = false;
      const title = "Feedback";
      const height = "auto";
      const position = {
        my: "left top",
        at: "right bottom",
        of: "#" + performanceData["enhancement-id"]
      };
      const buttons = {};

      view.feedbacker.showFeedback(submissionResponseData);

      sinon.assert.calledOnce(dialogSetupSpy);
      sinon.assert.calledWithExactly(dialogSetupSpy,
        isModal,
        $("#view-feedback-dialog"),
        title,
        height,
        position,
        buttons
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
  });
});
