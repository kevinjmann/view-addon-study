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

  before(function() {
    $("body").append("<div id='" + performanceData["enhancement-id"] + "'>");
  });

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
    $("#view-performance-dialog").remove();
  });

  describe("showPerformance", function() {
    it("should call addPerformanceData($Dialog, performanceData)", function() {
      const addPerformanceDataSpy = sandbox.spy(view.feedbacker, "addPerformanceData");

      view.feedbacker.showPerformance(performanceData);

      sinon.assert.calledOnce(addPerformanceDataSpy);

      sinon.assert.calledWithExactly(addPerformanceDataSpy,
        $("#view-performance-dialog"),
        performanceData
      );
    });

    describe("addPerformanceData", function() {
      it("should call lib.createList(id, items) to create the info list", function() {
        const createListSpy = sandbox.spy(view.lib, "createList");

        const $Dialog = $("<div>");
        $Dialog.attr("id", "view-performance-dialog");

        view.feedbacker.addPerformanceData($Dialog, performanceData);

        sinon.assert.calledOnce(createListSpy);
        sinon.assert.calledWithExactly(createListSpy,
          "bar-info",
          [
            "Number of tries: " + performanceData["number-of-tries"],
            "Assessment: " + performanceData["assessment"]
          ]
        );
      });

      it("should find the info list inside the performance dialog", function() {
        const $Dialog = $("<div>");
        $Dialog.attr("id", "view-performance-dialog");

        view.feedbacker.addPerformanceData($Dialog, performanceData);

        $("body").append($Dialog);

        expect($("#view-performance-dialog").find("#bar-info").length).to.be.above(0);
      });
    });

    it("should call lib.dialogSetup($Dialog, title, height, position)", function() {
      const dialogSetupSpy = sandbox.spy(view.lib, "dialogSetup");

      const title = "Performance";
      const height = "auto";
      const position = {
        my: "left top",
        at: "right bottom",
        of: "#" + performanceData["enhancement-id"]
      };

      view.feedbacker.showPerformance(performanceData);

      sinon.assert.calledOnce(dialogSetupSpy);
      sinon.assert.calledWithExactly(dialogSetupSpy,
        $("#view-performance-dialog"),
        title,
        height,
        position
      );
    });

    it("should call lib.initDialogClose($Dialog)", function() {
      const initDialogCloseSpy = sandbox.spy(view.lib, "initDialogClose");

      view.feedbacker.showPerformance(performanceData);

      sinon.assert.calledOnce(initDialogCloseSpy);
      sinon.assert.calledWithExactly(initDialogCloseSpy,
        $("#view-performance-dialog")
      );
    });

    it("should find the performance dialog", function() {
      view.feedbacker.showPerformance(performanceData);

      expect($("#view-performance-dialog").length).to.be.above(0);
    });
  });
});
