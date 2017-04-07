/**
 * Tests for the enhancement.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

describe("enhancer.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function() {
    sandbox.restore();
    fixture.cleanup();
    chrome.runtime.sendMessage.reset();
    view.activity = "";
    view.showInst = false;
    view.topics = {};
    view.topic = "";
    view.language = "";
    view.url = "";
    view.filter = "";
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors for this module", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems
      fixture.load("/fixtures/ru-no-markup.html");

      const fixtureInnerHTML = $("#ru-no-markup-body").html();
      const $FixtureBody = $("<div id='wertiview-content'>");

      $FixtureBody.html(fixtureInnerHTML);

      $("body").append($FixtureBody);

      expect($("#wertiview-content").length).to.be.above(0);
      expect($("#ru-no-markup-body").length).to.be.above(0);
    });
  });

  describe("enhance", function() {
    it("should call restoreToOriginal(), as there is still server markup in the page", function() {
      fixture.load("/fixtures/ru-nouns-mc-and-cloze.html");
      const restoreToOriginalSpy = sandbox.spy(view.enhancer, "restoreToOriginal");

      view.enhancer.enhance();

      sinon.assert.calledOnce(restoreToOriginalSpy);
    });

    describe("restoreToOriginal", function() {
      it("should call activityHelper.restore()", function() {
        const restoreSpy = sandbox.spy(view.activityHelper, "restore");

        view.enhancer.restoreToOriginal();

        sinon.assert.calledOnce(restoreSpy);
      });

      it("should replace a viewenhancement element with the original text", function() {
        fixture.load("/fixtures/ru-nouns-mc-and-cloze.html");

        expect($("p").contents().get(5).nodeType).to.equal(1);
        expect($("p").contents().get(5).nodeName).to.equal("VIEWENHANCEMENT");
        expect($("p").contents().get(5).textContent).to.equal("процесс");

        view.enhancer.restoreToOriginal();

        expect($("p").contents().get(5).nodeType).to.equal(3);
        expect($("p").contents().get(5).nodeName).to.equal("#text");
        expect($("p").contents().get(5).textContent).to.equal("процесс");
      });

      it("should call lib.enableAnchors()", function() {
        const enableAnchorsSpy = sandbox.spy(view.lib, "enableAnchors");

        view.enhancer.restoreToOriginal();

        sinon.assert.calledOnce(enableAnchorsSpy);
      });

      it("should call requestToToggleElement(msg, selector): hide restore button", function() {
        const requestToToggleElementSpy = sandbox.spy(view.enhancer, "requestToToggleElement");

        view.enhancer.restoreToOriginal();

        sinon.assert.calledOnce(requestToToggleElementSpy);
        sinon.assert.calledWithExactly(requestToToggleElementSpy,
          "hide element",
          "#wertiview-toolbar-restore-button"
        );
      });

      it("should call notification.remove()", function() {
        const removeSpy = sandbox.spy(view.notification, "remove");

        view.enhancer.restoreToOriginal();

        sinon.assert.calledOnce(removeSpy);
      });

      it("should call blur.remove()", function() {
        const removeSpy = sandbox.spy(view.blur, "remove");

        view.enhancer.restoreToOriginal();

        sinon.assert.calledOnce(removeSpy);
      });

      it("should remove the instruction notification", function() {
        const $Notification = $("<div>");
        $Notification.attr("id", "wertiview-inst-notification");

        $("body").append($Notification);

        expect($("#wertiview-inst-notification").length).to.be.above(0);

        view.enhancer.restoreToOriginal();

        expect($("#wertiview-inst-notification").length).to.equal(0);
      });
    });

    it("should call blur.add(), as the activity is 'cloze'", function() {
      const addSpy = sandbox.spy(view.blur, "add");

      view.activity = "cloze";

      view.enhancer.enhance();

      sinon.assert.calledOnce(addSpy);
    });

    it("should call constructInstruction(), as showInst is enabled", function() {
      const constructInstructionSpy = sandbox.spy(view.enhancer, "constructInstruction");
      const jsonData = fixture.load("fixtures/json/nouns.json");

      view.showInst = true;
      view.topic = "nouns";
      view.language = "ru";
      view.activity = "color";
      view.topics = {nouns: jsonData};

      view.enhancer.enhance();

      sinon.assert.calledOnce(constructInstructionSpy);
    });

    describe("constructInstruction", function() {
      it("should call notification.addInst(instruction, isAvoidable), as the instruction was found in topics", function() {
        const addInstSpy = sandbox.spy(view.notification, "addInst");
        const jsonData = fixture.load("fixtures/json/nouns.json");

        view.topic = "nouns";
        view.language = "ru";
        view.activity = "color";
        view.topics = {nouns: jsonData};

        view.enhancer.constructInstruction();

        sinon.assert.calledOnce(addInstSpy);
        sinon.assert.calledWithExactly(addInstSpy,
          "In the text, VIEW shows you the <span class='colorize-style-nouns'>Russian nouns</span>.",
          true
        );
      });

      it("should call notification.addInst(instruction, isAvoidable), as the instruction text was not found in topics", function() {
        const addInstSpy = sandbox.spy(view.notification, "addInst");
        const jsonData = fixture.load("fixtures/json/nouns.json");

        view.topic = "nouns";
        view.language = "ru";
        view.activity = "color";
        view.topics = {nouns: jsonData};

        const activities = view.topics[view.topic][view.language].activities;

        delete activities[view.activity].instruction.text;

        view.enhancer.constructInstruction();

        sinon.assert.calledOnce(addInstSpy);
        sinon.assert.calledWithExactly(addInstSpy,
          "The instruction for the topic " +
          "<span class='colorize-style-" + view.topic + "'>" + view.topic + "</span>" +
          " is missing!", false
        );
      });

      it("should not call notification.addInst(instruction, isAvoidable), as the instruction was not found in topics", function() {
        const addInstSpy = sandbox.spy(view.notification, "addInst");
        const jsonData = fixture.load("fixtures/json/nouns.json");

        view.topic = "nouns";
        view.language = "ru";
        view.activity = "color";
        view.topics = {nouns: jsonData};

        const activities = view.topics[view.topic][view.language].activities;

        delete activities[view.activity].instruction;

        view.enhancer.constructInstruction();

        sinon.assert.notCalled(addInstSpy);
      });
    });

    it("should call requestToToggleElement(msg, selector): show abort button", function() {
      const requestToToggleElementSpy = sandbox.spy(view.enhancer, "requestToToggleElement");

      view.enhancer.enhance();

      sinon.assert.calledOnce(requestToToggleElementSpy);
      sinon.assert.calledWithExactly(requestToToggleElementSpy,
        "show element",
        "#wertiview-toolbar-abort-button"
      );
    });

    it("should call createActivityData()", function() {
      const createActivityDataSpy = sandbox.spy(view.enhancer, "createActivityData");

      view.enhancer.enhance();

      sinon.assert.calledOnce(createActivityDataSpy);
    });

    it("should return the activity data", function() {
      const url = "some-url";
      const language = "ru";
      const topic = "nouns";
      const filter = "Pl";
      const activity = "color";

      const activityData = {
        url,
        language,
        topic,
        filter,
        activity,
        document: $("#wertiview-content").html()
      };

      view.url = url;
      view.language = language;
      view.topic = topic;
      view.filter = filter;
      view.activity = activity;

      const returnedActivityData = view.enhancer.createActivityData();

      expect(activityData).to.eql(returnedActivityData);
    });

    it("should call requestToSendActivityDataAndGetEnhancementMarkup(activityData)", function() {
      const requestToSendActivityDataAndGetEnhancementMarkupSpy =
        sandbox.spy(view.enhancer, "requestToSendActivityDataAndGetEnhancementMarkup");

      const url = "some-url";
      const language = "ru";
      const topic = "nouns";
      const filter = "Pl";
      const activity = "color";

      view.url = url;
      view.language = language;
      view.topic = topic;
      view.filter = filter;
      view.activity = activity;

      view.enhancer.enhance();

      sinon.assert.calledOnce(requestToSendActivityDataAndGetEnhancementMarkupSpy);
      sinon.assert.calledWithExactly(requestToSendActivityDataAndGetEnhancementMarkupSpy, {
        url: url,
        language: language,
        topic: topic,
        filter: filter,
        activity: activity,
        document: $("#wertiview-content").html()
      });
    });

    it("should send a request to send activity data and get enhancement markup", function() {
      const url = "some-url";
      const language = "ru";
      const topic = "nouns";
      const filter = "Pl";
      const activity = "color";

      const activityData = {
        url,
        language,
        topic,
        filter,
        activity,
        document: $("#wertiview-content").html()
      };

      view.enhancer.requestToSendActivityDataAndGetEnhancementMarkup(activityData);

      sinon.assert.calledOnce(chrome.runtime.sendMessage);
      sinon.assert.calledWith(chrome.runtime.sendMessage, {
        msg: "send activityData and get enhancement markup",
        activityData: activityData,
        ajaxTimeout: 60000,
        servletURL: "https://view.aleks.bg/view"
      });
    });
  });

  describe("initialInteractionState", function() {
    it("should call requestToToggleElement(msg, selector): hide loading image", function() {
      const requestToToggleElementSpy = sandbox.spy(view.enhancer, "requestToToggleElement");

      view.enhancer.initialInteractionState();

      sinon.assert.called(requestToToggleElementSpy);
      sinon.assert.calledWithExactly(requestToToggleElementSpy.getCall(0),
        "hide element",
        "#wertiview-toolbar-loading-image"
      );
    });

    it("should call requestToToggleElement(msg, selector): hide abort button", function() {
      const requestToToggleElementSpy = sandbox.spy(view.enhancer, "requestToToggleElement");

      view.enhancer.initialInteractionState();

      sinon.assert.called(requestToToggleElementSpy);
      sinon.assert.calledWithExactly(requestToToggleElementSpy.getCall(1),
        "hide element",
        "#wertiview-toolbar-abort-button"
      );
    });

    it("should call requestToToggleElement(msg, selector): show enhance button", function() {
      const requestToToggleElementSpy = sandbox.spy(view.enhancer, "requestToToggleElement");

      view.enhancer.initialInteractionState();

      sinon.assert.called(requestToToggleElementSpy);
      sinon.assert.calledWithExactly(requestToToggleElementSpy.getCall(2),
        "show element",
        "#wertiview-toolbar-enhance-button"
      );
    });
  });
});
