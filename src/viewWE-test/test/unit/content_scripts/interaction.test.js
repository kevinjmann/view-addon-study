/**
 * Tests for the interaction.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

describe("interaction.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    sandbox.stub($.fn, "load").yields();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.extension.getURL.reset();
    view.interaction.toolbarUI = undefined;
    $("#view-toolbar-iframe").remove();
    $("body").append($("#ru-no-markup-body"));
    $("#wertiview-container").remove();
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
      fixture.load("/fixtures/ru-no-markup.html");

      view.interaction.initToolbar();

      expect($("#view-toolbar-iframe").length).to.be.above(0);
      expect($("#wertiview-container").length).to.be.above(0);
      expect($("#wertiview-content").length).to.be.above(0);
      expect($("#ru-no-markup-body").length).to.be.above(0);
    });
  });

  describe("initToolbar", function() {
    it("should get the correct url", function() {
      view.interaction.initToolbar();

      sinon.assert.called(chrome.runtime.getURL);
      sinon.assert.calledWithExactly(chrome.runtime.getURL, "toolbar/toolbar.html");
    });

    it("should assign the correct id", function() {
      const attrSpy = sandbox.spy($.fn, "attr");

      view.interaction.initToolbar();

      sinon.assert.called(attrSpy);
      sinon.assert.calledWithExactly(attrSpy.getCall(0),
        "id",
        "view-toolbar-iframe"
      );
    });

    it("should assign a src", function() {
      const attrSpy = sandbox.spy($.fn, "attr");

      view.interaction.initToolbar();

      sinon.assert.called(attrSpy);
      sinon.assert.calledWith(attrSpy.getCall(1), "src");
    });

    it("should call addChildContainer(selector)", function() {
      const addChildContainerSpy = sandbox.spy(view.interaction, "addChildContainer");

      view.interaction.initToolbar();

      sinon.assert.calledOnce(addChildContainerSpy);
    });

    describe("addChildContainer", function() {
      it("should wrap all body content of 'ru-no-markup.html' into a new element", function() {
        fixture.load("/fixtures/ru-no-markup.html");

        const fixtureInnerHTML = $("#ru-no-markup-body").html();
        const $FixtureBody = $("<div>");

        $FixtureBody.html(fixtureInnerHTML);

        $("body").append($FixtureBody);

        view.interaction.addChildContainer($FixtureBody);

        expect($("#wertiview-content").html()).to.equal(fixtureInnerHTML);

        $FixtureBody.remove();
      });

      it("should put wrapped body content into the container", function() {
        fixture.load("/fixtures/ru-no-markup.html");

        const fixtureInnerHTML = $("#ru-no-markup-body").html();
        const $FixtureBody = $("<div>");

        $FixtureBody.html(fixtureInnerHTML);

        $("body").append($FixtureBody);

        view.interaction.addChildContainer($FixtureBody);

        const bodyContainerSelector = "#wertiview-container";

        expect($(bodyContainerSelector).html())
        .to.equal("<div id=\"wertiview-content\">" + fixtureInnerHTML + "</div>");

        $FixtureBody.remove();
      });

      it("should have the class 'down' in the container", function() {
        fixture.load("/fixtures/ru-no-markup.html");

        const fixtureInnerHTML = $("#ru-no-markup-body").html();
        const $FixtureBody = $("<div>");

        $FixtureBody.html(fixtureInnerHTML);

        $("body").append($FixtureBody);

        view.interaction.addChildContainer($FixtureBody);

        expect($("#wertiview-container").hasClass("down")).to.be.true;

        $FixtureBody.remove();
      });
    });

    it("should call VIEWmenu.add()", function() {
      const addSpy = sandbox.spy(view.VIEWmenu, "add");

      view.interaction.initToolbar();

      sinon.assert.calledOnce(addSpy);
    });

    it("should call prepend(iframe)", function() {
      const prependSpy = sandbox.spy($.fn, "prepend");

      view.interaction.initToolbar();

      sinon.assert.called(prependSpy);
      expect($(prependSpy.getCall(1).args[0]).attr("id")).to.equal("view-toolbar-iframe");
    });

    it("should return the iframe", function() {
      view.interaction.initToolbar();
      expect($(view.interaction.toolbarUI).attr("id")).to.equal("view-toolbar-iframe");
    });
  });

  describe("toggleToolbar", function() {
    it("should toggle the toolbar, as it already exists", function() {
      const toggleSpy = sandbox.spy($.fn, "toggle");

      view.interaction.initToolbar();

      view.interaction.toggleToolbar();

      sinon.assert.called(toggleSpy);
    });

    it("should call moveContainer(), as the toolbar exists", function() {
      const moveContainerSpy = sandbox.spy(view.interaction, "moveContainer");

      view.interaction.initToolbar();

      view.interaction.toggleToolbar();

      sinon.assert.called(moveContainerSpy);
    });

    describe("moveContainer", function() {
      it("should find the class 'down' inside the container, as the toolbar is visible", function() {
        view.interaction.initToolbar();

        $("#wertiview-container").removeClass("down");

        view.interaction.moveContainer();

        expect($("#wertiview-container").hasClass("down")).to.be.true;
      });

      it("should call VIEWmenu.hide(), as the toolbar is hidden", function() {
        const hideSpy = sandbox.spy(view.VIEWmenu, "hide");

        view.interaction.initToolbar();

        $("#view-toolbar-iframe").hide();

        view.interaction.moveContainer();

        sinon.assert.called(hideSpy);
      });

      it("should not find the class 'down' inside the container, as the toolbar is hidden", function() {
        view.interaction.initToolbar();

        $("#view-toolbar-iframe").hide();

        expect($("#wertiview-container").hasClass("down")).to.be.true;

        view.interaction.moveContainer();

        expect($("#wertiview-container").hasClass("down")).to.be.false;
      });
    });

    it("should call setGeneralOptions(), as the toolbar doesn't exists yet", function() {
      const setGeneralOptionsSpy = sandbox.spy(view, "setGeneralOptions");

      view.interaction.toggleToolbar();

      sinon.assert.called(setGeneralOptionsSpy);
    });

    it("should call initToolbar(), as the toolbar doesn't exists yet", function() {
      const initToolbarSpy = sandbox.spy(view.interaction, "initToolbar");

      view.interaction.toggleToolbar();

      sinon.assert.called(initToolbarSpy);
    });
  });
});
