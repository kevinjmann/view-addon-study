/**
 * Tests for the toolbar-iframe.js file of the VIEW add-on.
 *
 * Created by eduard on 29.03.17.
 */

"use strict";

describe("toolbar-iframe.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();

    sandbox.stub($.fn, "load").yields();
  });

  afterEach(function() {
    sandbox.restore();
    chrome.extension.getURL.reset();
    $("#view-toolbar-iframe").remove();
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors for this module", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems
      view.toolbarIframe.init();

      expect($("#view-toolbar-iframe").length).to.be.above(0);
    });
  });

  describe("init", function() {
    it("should get the correct url", function() {
      view.toolbarIframe.init();

      sinon.assert.called(chrome.runtime.getURL);
      sinon.assert.calledWithExactly(chrome.runtime.getURL, "toolbar/toolbar.html");
    });

    it("should assign the correct id", function() {
      const attrSpy = sandbox.spy($.fn, "attr");

      view.toolbarIframe.init();

      sinon.assert.called(attrSpy);
      sinon.assert.calledWithExactly(attrSpy.getCall(0),
        "id",
        "view-toolbar-iframe"
      );
    });

    it("should assign a src", function() {
      const attrSpy = sandbox.spy($.fn, "attr");

      view.toolbarIframe.init();

      sinon.assert.called(attrSpy);
      sinon.assert.calledWith(attrSpy.getCall(1), "src");
    });

    it("should call add(selector)", function() {
      const addSpy = sandbox.spy(view.container, "add");

      view.toolbarIframe.init();

      sinon.assert.calledOnce(addSpy);
    });

    it("should call VIEWmenu.add()", function() {
      const addSpy = sandbox.spy(view.VIEWmenu, "add");

      view.toolbarIframe.init();

      sinon.assert.calledOnce(addSpy);
    });

    it("should call statisticsMenu.add()", function() {
      const addSpy = sandbox.spy(view.statisticsMenu, "add");

      view.toolbarIframe.init();

      sinon.assert.calledOnce(addSpy);
    });

    it("should call lib.initOnWindowClick()", function() {
      const initOnWindowClickSpy = sandbox.spy(view.lib, "initOnWindowClick");

      view.toolbarIframe.init();

      sinon.assert.calledOnce(initOnWindowClickSpy);
    });

    it("should call prepend(toolbar)", function() {
      const prependSpy = sandbox.spy($.fn, "prepend");

      view.toolbarIframe.init();

      sinon.assert.called(prependSpy);
      expect($(prependSpy.getCall(2).args[0]).attr("id")).to.equal("view-toolbar-iframe");
    });
  });

  describe("toggle", function() {
    it("should toggle the toolbar, as it already exists", function() {
      const toggleSpy = sandbox.spy($.fn, "toggle");

      view.toolbarIframe.init();

      view.toolbarIframe.toggle();

      sinon.assert.called(toggleSpy);
    });

    it("should call adjustMargin(), as the toolbar exists", function() {
      const adjustMarginSpy = sandbox.spy(view.container, "adjustMargin");

      view.toolbarIframe.init();

      view.toolbarIframe.toggle();

      sinon.assert.called(adjustMarginSpy);
    });

    it("should call setGeneralOptions(), as the toolbar doesn't exists yet", function() {
      const setGeneralOptionsSpy = sandbox.spy(view, "setGeneralOptions");

      view.toolbarIframe.toggle();

      sinon.assert.called(setGeneralOptionsSpy);
    });

    it("should call init(), as the toolbar doesn't exists yet", function() {
      const initToolbarSpy = sandbox.spy(view.toolbarIframe, "init");

      view.toolbarIframe.toggle();

      sinon.assert.called(initToolbarSpy);
    });
  });
});
