/**
 * Tests for the view-menu.js file of the VIEW add-on.
 *
 * Created by eduard on 14.01.17.
 */

"use strict";

describe("view-menu.js", function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fixture.load("/fixtures/view-menu.html");
  });

  afterEach(function() {
    sandbox.restore();
    chrome.runtime.sendMessage.reset();
    fixture.cleanup();
  });

  describe("jquery selectors", function() {
    it("should be able to find all required jquery selectors in the view menu", function() {
      // some selectors only need the element, its enough if they exist
      // some selectors need the val(), text() or attr("link"),
      // if there is the value we expect, they exist as well
      // maintain this test, if there are additions or changes
      // the expectations below don't need to be tested in other tests again
      // the selectors below can be freely used in the tests without problems

      expect($(view.VIEWmenu.selectorStart + "content").length).to.be.above(0);
      expect($(view.VIEWmenu.selectorStart + "options").length).to.be.above(0);
      expect($(view.VIEWmenu.selectorStart + "help").length).to.be.above(0);
      expect($(view.VIEWmenu.selectorStart + "about").length).to.be.above(0);
    });
  });

  describe("add", function() {
    it("should get the url for the view menu, call init() and prepend(viewMenu)", function() {
      const loadStub = sandbox.stub($.fn, "load");
      const selectorSpy = sandbox.spy($.fn, "find");
      const prependSpy = sandbox.spy($.fn, "prepend");
      const initSpy = sandbox.spy(view.VIEWmenu, "init");

      loadStub.yields();

      view.VIEWmenu.add();

      sinon.assert.calledOnce(chrome.extension.getURL);
      sinon.assert.calledWithExactly(chrome.extension.getURL, "content_scripts/html/view-menu.html");

      sinon.assert.calledOnce(initSpy);

      sinon.assert.calledOnce(selectorSpy);
      sinon.assert.calledWithExactly(selectorSpy, "body");

      sinon.assert.calledOnce(prependSpy);
    });

    describe("init", function() {
      it("should initialize all view menu handlers", function() {
        const initHideMenuHandlerSpy = sandbox.spy(view.VIEWmenu, "initHideMenuHandler");
        const initOpenOptionsPageHandlerSpy = sandbox.spy(view.VIEWmenu, "initOpenOptionsPageHandler");
        const initOpenHelpPageHandlerSpy = sandbox.spy(view.VIEWmenu, "initOpenHelpPageHandler");
        const initOpenAboutDialogHandlerSpy = sandbox.spy(view.VIEWmenu, "initOpenAboutDialogHandler");

        view.VIEWmenu.init();

        sinon.assert.calledOnce(initHideMenuHandlerSpy);
        sinon.assert.calledOnce(initOpenOptionsPageHandlerSpy);
        sinon.assert.calledOnce(initOpenHelpPageHandlerSpy);
        sinon.assert.calledOnce(initOpenAboutDialogHandlerSpy);
      });

      describe("initHideMenuHandler", function() {
        it("should initialize the hide menu handler", function() {
          const eventSpy = sandbox.spy($.fn, "on");

          view.VIEWmenu.initHideMenuHandler();

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call hide() on click", function() {
          const hideSpy = sandbox.spy(view.VIEWmenu, "hide");

          view.VIEWmenu.initHideMenuHandler();

          $(window).trigger("click");

          sinon.assert.calledOnce(hideSpy);
        });

        it("should hide the view menu", function() {
          view.VIEWmenu.toggle();

          expect($(view.VIEWmenu.selectorStart + "content").is(":visible")).to.be.true;

          view.VIEWmenu.hide();

          expect($(view.VIEWmenu.selectorStart + "content").is(":hidden")).to.be.true;
        });
      });

      describe("initOpenOptionsPageHandler", function() {
        it("should initialize the open options page handler", function() {
          const selectorSpy = sandbox.spy(document, "getElementById");
          const eventSpy = sandbox.spy($.fn, "on");

          view.VIEWmenu.initOpenOptionsPageHandler();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, view.VIEWmenu.selectorStart.substr(1) + "options");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call requestToCallOpenOptionsPage() on click", function() {
          const requestToCallOpenOptionsPageSpy = sandbox.spy(view.VIEWmenu, "requestToCallOpenOptionsPage");

          view.VIEWmenu.initOpenOptionsPageHandler();

          $("body").prepend($(view.VIEWmenu.selectorStart + "content"));

          $(view.VIEWmenu.selectorStart + "options").trigger("click");

          sinon.assert.calledOnce(requestToCallOpenOptionsPageSpy);
        });

        it("should send a request to call openOptionsPage()", function() {
          view.VIEWmenu.requestToCallOpenOptionsPage();

          sinon.assert.calledOnce(chrome.runtime.sendMessage);
          sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "call openOptionsPage"});
        });
      });

      describe("initOpenHelpPageHandler", function() {
        it("should initialize the open help page handler", function() {
          const selectorSpy = sandbox.spy(document, "getElementById");
          const eventSpy = sandbox.spy($.fn, "on");

          view.VIEWmenu.initOpenHelpPageHandler();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, view.VIEWmenu.selectorStart.substr(1) + "help");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call requestToOpenHelpPage() on click", function() {
          const requestToOpenHelpPageSpy = sandbox.spy(view.VIEWmenu, "requestToOpenHelpPage");

          view.VIEWmenu.initOpenHelpPageHandler();

          $(view.VIEWmenu.selectorStart + "help").trigger("click");

          sinon.assert.calledOnce(requestToOpenHelpPageSpy);
        });

        it("should send a request to open the help page", function() {
          view.VIEWmenu.requestToOpenHelpPage();

          sinon.assert.calledOnce(chrome.runtime.sendMessage);
          sinon.assert.calledWith(chrome.runtime.sendMessage, {msg: "open help page"});
        });
      });

      describe("initOpenAboutDialogHandler", function() {
        it("should initialize the open about dialog handler", function() {
          const selectorSpy = sandbox.spy(document, "getElementById");
          const eventSpy = sandbox.spy($.fn, "on");

          view.VIEWmenu.initOpenAboutDialogHandler();

          sinon.assert.calledOnce(selectorSpy);
          sinon.assert.calledWithExactly(selectorSpy, view.VIEWmenu.selectorStart.substr(1) + "about");

          sinon.assert.calledOnce(eventSpy);
          sinon.assert.calledWith(eventSpy, "click");
        });

        it("should call view.about.open() on click", function() {
          const viewAboutOpenSpy = sandbox.spy(view.about, "open");
          const loadStub = sandbox.stub($.fn, "load");

          loadStub.yields();

          view.VIEWmenu.initOpenAboutDialogHandler();

          $(view.VIEWmenu.selectorStart + "about").trigger("click");

          sinon.assert.calledOnce(viewAboutOpenSpy);
        });
      });

      describe("toggle", function() {
        it("should toggle the view menu", function() {
          expect($(view.VIEWmenu.selectorStart + "content").is(":hidden")).to.be.true;

          view.VIEWmenu.toggle();

          expect($(view.VIEWmenu.selectorStart + "content").is(":visible")).to.be.true;

          view.VIEWmenu.toggle();

          expect($(view.VIEWmenu.selectorStart + "content").is(":hidden")).to.be.true;
        });
      });
    });
  });
});
