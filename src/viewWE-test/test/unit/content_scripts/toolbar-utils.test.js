/**
 * Tests for the toolbar-utils.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

describe("toolbar-utils.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    sandbox.stub($.fn, "load").yields();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.extension.getURL.reset();
    view.toolbarUtils.toolbar = undefined;
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

      view.toolbarUtils.init();

      expect($("#view-toolbar-iframe").length).to.be.above(0);
      expect($("#wertiview-container").length).to.be.above(0);
      expect($("#wertiview-content").length).to.be.above(0);
      expect($("#ru-no-markup-body").length).to.be.above(0);
    });
  });

  describe("init", function() {
    it("should get the correct url", function() {
      view.toolbarUtils.init();

      sinon.assert.called(chrome.runtime.getURL);
      sinon.assert.calledWithExactly(chrome.runtime.getURL, "toolbar/toolbar.html");
    });

    it("should assign the correct id", function() {
      const attrSpy = sandbox.spy($.fn, "attr");

      view.toolbarUtils.init();

      sinon.assert.called(attrSpy);
      sinon.assert.calledWithExactly(attrSpy.getCall(0),
        "id",
        "view-toolbar-iframe"
      );
    });

    it("should assign a src", function() {
      const attrSpy = sandbox.spy($.fn, "attr");

      view.toolbarUtils.init();

      sinon.assert.called(attrSpy);
      sinon.assert.calledWith(attrSpy.getCall(1), "src");
    });

    it("should call addContainer(selector)", function() {
      const addContainerSpy = sandbox.spy(view.toolbarUtils, "addContainer");

      view.toolbarUtils.init();

      sinon.assert.calledOnce(addContainerSpy);
    });

    describe("addContainer", function() {
      it("should wrap all body content of 'ru-no-markup.html' into a new element", function() {
        fixture.load("/fixtures/ru-no-markup.html");

        const fixtureInnerHTML = $("#ru-no-markup-body").html();
        const $FixtureBody = $("<div>");

        $FixtureBody.html(fixtureInnerHTML);

        $("body").append($FixtureBody);

        view.toolbarUtils.addContainer($FixtureBody);

        expect($("#wertiview-content").html()).to.equal(fixtureInnerHTML);

        $FixtureBody.remove();
      });

      it("should put wrapped body content into the container", function() {
        fixture.load("/fixtures/ru-no-markup.html");

        const fixtureInnerHTML = $("#ru-no-markup-body").html();
        const $FixtureBody = $("<div>");

        $FixtureBody.html(fixtureInnerHTML);

        $("body").append($FixtureBody);

        view.toolbarUtils.addContainer($FixtureBody);

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

        view.toolbarUtils.addContainer($FixtureBody);

        expect($("#wertiview-container").hasClass("down")).to.be.true;

        $FixtureBody.remove();
      });
    });

    it("should call VIEWmenu.add()", function() {
      const addSpy = sandbox.spy(view.VIEWmenu, "add");

      view.toolbarUtils.init();

      sinon.assert.calledOnce(addSpy);
    });

    it("should call prepend(toolbar)", function() {
      const prependSpy = sandbox.spy($.fn, "prepend");

      view.toolbarUtils.init();

      sinon.assert.called(prependSpy);
      expect($(prependSpy.getCall(1).args[0]).attr("id")).to.equal("view-toolbar-iframe");
    });

    it("should return the toolbar", function() {
      view.toolbarUtils.init();
      expect($(view.toolbarUtils.toolbar).attr("id")).to.equal("view-toolbar-iframe");
    });
  });

  describe("toggle", function() {
    it("should toggle the toolbar, as it already exists", function() {
      const toggleSpy = sandbox.spy($.fn, "toggle");

      view.toolbarUtils.init();

      view.toolbarUtils.toggle();

      sinon.assert.called(toggleSpy);
    });

    it("should call moveContainer(), as the toolbar exists", function() {
      const moveContainerSpy = sandbox.spy(view.toolbarUtils, "moveContainer");

      view.toolbarUtils.init();

      view.toolbarUtils.toggle();

      sinon.assert.called(moveContainerSpy);
    });

    describe("moveContainer", function() {
      it("should find the class 'down' inside the container, as the toolbar is visible", function() {
        view.toolbarUtils.init();

        $("#wertiview-container").removeClass("down");

        view.toolbarUtils.moveContainer();

        expect($("#wertiview-container").hasClass("down")).to.be.true;
      });

      it("should call VIEWmenu.hide(), as the toolbar is hidden", function() {
        const hideSpy = sandbox.spy(view.VIEWmenu, "hide");

        view.toolbarUtils.init();

        $("#view-toolbar-iframe").hide();

        view.toolbarUtils.moveContainer();

        sinon.assert.called(hideSpy);
      });

      it("should not find the class 'down' inside the container, as the toolbar is hidden", function() {
        view.toolbarUtils.init();

        $("#view-toolbar-iframe").hide();

        expect($("#wertiview-container").hasClass("down")).to.be.true;

        view.toolbarUtils.moveContainer();

        expect($("#wertiview-container").hasClass("down")).to.be.false;
      });
    });

    it("should call setGeneralOptions(), as the toolbar doesn't exists yet", function() {
      const setGeneralOptionsSpy = sandbox.spy(view, "setGeneralOptions");

      view.toolbarUtils.toggle();

      sinon.assert.called(setGeneralOptionsSpy);
    });

    it("should call init(), as the toolbar doesn't exists yet", function() {
      const initToolbarSpy = sandbox.spy(view.toolbarUtils, "init");

      view.toolbarUtils.toggle();

      sinon.assert.called(initToolbarSpy);
    });
  });
});
